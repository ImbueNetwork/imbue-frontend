import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const data: any = req.query;

    const { user_id, id } = data;

    if (id) {
      await db.transaction(async (tx: any) => {
        try {
          await models
            .findSavedBriefById(
              id,
              user_id
            )(tx)
            .then(async (brief: any) => {
              const isSaved = brief ? true : false;

              res.status(200).json({ isSaved });
            });
        } catch (e) {
          new Error(`Failed to fetch saved briefs`, { cause: e as Error });
        }
      });
    }
  }
);
