import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchProjectById,
  updateMilestone,
  updateProjectVoting,
} from '@/lib/models';
import { fetchProjectApprovers } from '@/lib/models';
import {
  addVoteToDB,
  checkExistingVote,
  getAllVoteAddress,
  getPendingVotes,
  getYesOrNoVotes,
  updateVoteDB,
} from '@/lib/queryServices/projectQueries';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex } = req.query;

        if (projectId == undefined || milestoneIndex == undefined)
          return res.status(404).json({
            message:
              'Project not found. Please use valid project ID and milestone index',
          });

        const pending = await getPendingVotes(projectId, milestoneIndex)(tx);

        const yes = await getYesOrNoVotes(projectId, milestoneIndex, true)(tx);

        const no = await getYesOrNoVotes(projectId, milestoneIndex, false)(tx);

        const allVotersRes = await getAllVoteAddress(
          projectId,
          milestoneIndex
        )(tx);

        const allVotesAddresses = allVotersRes.map((v) => v.voter_address);

        res.status(200).json({
          yes,
          no,
          pending,
          allVoters: allVotesAddresses,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        res.status(404).json({ message: `Internal Error: ${error}` });
      }
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex, userId, voterAddress, vote } =
          JSON.parse(req.body);

        // const userAuth: Partial<models.User> | any = await authenticate(
        //   'jwt',
        //   req,
        //   res
        // );

        // await verifyUserIdFromJwt(req, res, [userAuth.id]);

        const existingVote = await checkExistingVote(
          projectId,
          milestoneIndex,
          voterAddress
        )(tx);

        const project = await fetchProjectById(projectId)(tx);
        let milestoneApproved = false;

        if (project?.brief_id) {
          const updatedMilestone = await updateMilestone(
            Number(projectId),
            Number(milestoneIndex),
            { is_approved: vote }
          )(tx);

          milestoneApproved = updatedMilestone[0].is_approved;
        }

        if (existingVote?.id && existingVote?.vote === vote)
          return res.status(500).json({ message: 'Nothing to update' });

        if (!existingVote?.id) {
          const resp = await addVoteToDB(
            projectId,
            milestoneIndex,
            voterAddress,
            userId,
            vote
          )(tx);

          if (resp?.length)
            res.status(200).json({ status: 'success', milestoneApproved });
        } else {
          const resp = await updateVoteDB(
            projectId,
            milestoneIndex,
            vote,
            voterAddress
          )(tx);

          if (resp)
            res.status(200).json({ status: 'success', milestoneApproved });
        }

        const yes = await getYesOrNoVotes(projectId, milestoneIndex, true)(tx);

        const no = await getYesOrNoVotes(projectId, milestoneIndex, false)(tx);

        const allVotersRes = await fetchProjectApprovers(projectId)(tx);

        if (
          yes.length / allVotersRes.length >= 0.75 ||
          no.length / allVotersRes.length >= 0.75
        ) {
          await updateProjectVoting(Number(projectId), false)(tx);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });
