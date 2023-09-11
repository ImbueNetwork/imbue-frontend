import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex, userId, voterAddress, vote } =
          JSON.parse(req.body);

        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        verifyUserIdFromJwt(req, res, [userAuth.id]);

        const existingVote = await tx('project_votes')
          .select('id', 'vote')
          .where({ project_id: projectId, milestone_index: milestoneIndex })
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
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });
