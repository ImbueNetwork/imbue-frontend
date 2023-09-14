import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

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

        const pending = await tx('project_approvers')
          .select('*')
          .leftJoin(
            'project_votes',
            'project_votes.voter_address',
            'project_approvers.approver'
          )
          .leftJoin('users', 'users.web3_address', 'project_approvers.approver')
          .where({ 'project_approvers.project_id': projectId, vote: null });

        const yes = await tx('project_votes')
          .select('*')
          .where({
            project_id: projectId,
            milestone_index: milestoneIndex,
            vote: true,
          })
          .leftJoin(
            'users',
            'users.web3_address',
            'project_votes.voter_address'
          );

        const no = await tx('project_votes')
          .select('*')
          .where({
            project_id: projectId,
            milestone_index: milestoneIndex,
            vote: false,
          })
          .leftJoin(
            'users',
            'users.web3_address',
            'project_votes.voter_address'
          );

        res.status(200).json({
          yes,
          no,
          pending,
        });
      } catch (error) {
        console.log('🚀 ~ file: index.ts:51 ~ db.transaction ~ error:', error);
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

        const existingVote = await tx('project_votes')
          .select('id', 'vote')
          .where({
            project_id: projectId,
            milestone_index: milestoneIndex,
            voter_address: voterAddress,
          })
          .first();

        if (existingVote?.id && existingVote?.vote === vote)
          return res.status(500).json({ message: 'Nothing to update' });

        if (!existingVote?.id) {
          const resp = await tx('project_votes')
            .insert({
              project_id: Number(projectId),
              milestone_index: Number(milestoneIndex),
              user_id: Number(userId),
              voter_address: voterAddress,
              vote,
            })
            .returning('id');

          if (resp?.length) return res.status(200).json({ status: 'success' });
        } else {
          const resp = await tx('project_votes')
            .update({
              vote,
            })
            .where({
              project_id: Number(projectId),
              milestone_index: Number(milestoneIndex),
            });

          if (resp) return res.status(200).json({ status: 'success' });
        }
      } catch (error) {
        console.log('🚀 ~ file: index.ts:102 ~ db.transaction ~ error:', error);
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });
