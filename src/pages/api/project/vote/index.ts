import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  addVoteToDB,
  checkExistingVote,
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

        const pending = await getPendingVotes(projectId)(tx);

        const yes = await getYesOrNoVotes(projectId, milestoneIndex, true)(tx);

        const no = await getYesOrNoVotes(projectId, milestoneIndex, false)(tx);

        res.status(200).json({
          yes,
          no,
          pending,
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

          if (resp?.length) return res.status(200).json({ status: 'success' });
        } else {
          const resp = await updateVoteDB(
            projectId,
            milestoneIndex,
            vote,
            voterAddress
          )(tx);

          if (resp) return res.status(200).json({ status: 'success' });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });