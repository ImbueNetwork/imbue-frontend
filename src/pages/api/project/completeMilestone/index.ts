import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex } = req.query;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        const projectApproverIds = await models.fetchProjectApproverUserIds(
          Number(projectId)
        )(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        await models.updateFirstPendingMilestoneService(
          Number(projectId),
          Number(milestoneIndex) + 1
        )(tx);

        await models.updateMilestone(
          Number(projectId),
          Number(milestoneIndex),
          { is_approved: true }
        )(tx);

        const result = await models.updateProjectVoting(
          Number(projectId),
          false
        )(tx);

        return res.status(201).json(result);
      } catch (cause) {
        // eslint-disable-next-line no-console
        console.error(cause)
        return res.status(401).json(cause);
      }
    });
  });
