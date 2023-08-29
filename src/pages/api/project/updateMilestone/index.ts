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
        const { projectId, milestoneIndex, approve, firstPendingMilestone } =
          req.query;

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

        if (firstPendingMilestone !== undefined) {
          const response = await models.updateFirstPendingMilestoneService(
            Number(projectId),
            Number(firstPendingMilestone)
          )(tx);

          return res.status(200).send(response);
        }

        if (milestoneIndex == undefined || approve == undefined)
          return res
            .status(401)
            .json({ message: 'No milestone found for update' });

        const is_approved = approve === 'true' ? true : false;

        const result = await models.updateMilestone(
          Number(projectId),
          Number(milestoneIndex),
          { is_approved }
        )(tx);
        return res.status(201).json(result);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
