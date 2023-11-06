import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  checkExistingVote,
} from '@/lib/queryServices/projectQueries';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { chainVotes, projectID, milestoneIndex } = JSON.parse(req.body);

        // const userAuth: Partial<models.User> | any = await authenticate(
        //   'jwt',
        //   req,
        //   res
        // );

        // await verifyUserIdFromJwt(req, res, [userAuth.id]);

        // const projectVotes = await tx('project_votes')
        //   .select('voter_address')
        //   .where({ project_id: projectID, milestone_index: milestoneIndex });

        chainVotes.map(async (vote: any) => {
          const existingVote = await checkExistingVote(
            projectID,
            milestoneIndex,
            vote.voterAddress
          )(tx);

          if (existingVote?.id && existingVote?.vote === vote.vote) return;

        //   if (!existingVote?.id) {
        //     return await addVoteToDB(
        //       projectID,
        //       milestoneIndex,
        //       vote.voterAddress,
        //       '',
        //       vote.vote
        //     )(tx);
        //     //   .rightJoin(
        //     //     'users',
        //     //     'users.web3_address',
        //     //     'project_votes.voter_address'
        //     //   )
        //     //   .returning('*');
        //   } else {
        //     return await updateVoteDB(
        //       projectID,
        //       milestoneIndex,
        //       vote.vote,
        //       vote.voterAddress
        //     )(tx);
        //     //   .rightJoin(
        //     //     'users',
        //     //     'users.web3_address',
        //     //     'project_votes.voter_address'
        //     //   )
        //     //   .returning('*');
        //   }
        });


        // const existingVote = await checkExistingVote(
        //   projectId,
        //   milestoneIndex,
        //   voterAddress
        // )(tx);

        // if (existingVote?.id && existingVote?.vote === vote)
        //   return res.status(500).json({ message: 'Nothing to update' });

        // if (!existingVote?.id) {
        //   const resp = await addVoteToDB(
        //     projectId,
        //     milestoneIndex,
        //     voterAddress,
        //     userId,
        //     vote
        //   )(tx);

        //   if (resp?.length) return res.status(200).json({ status: 'success' });
        // } else {
        //   const resp = await updateVoteDB(
        //     projectId,
        //     milestoneIndex,
        //     vote,
        //     voterAddress
        //   )(tx);

        //   if (resp) return res.status(200).json({ status: 'success' });
        // }

        return res.status(200).json({ status: 'success' });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });
