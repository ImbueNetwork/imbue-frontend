import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex, approve } = req.query;

        if (!projectId || !milestoneIndex || !approve) {
          return res
            .status(401)
            .json({ message: 'No milestone found for update' });
        }

        const is_approved = approve === "true" ? true : false;

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
