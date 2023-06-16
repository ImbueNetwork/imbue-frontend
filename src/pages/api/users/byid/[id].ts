import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';
import { User } from '@/model';

import * as models from '../../models';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id;
    db.transaction(async (tx) => {
      try {
        const user: User = (await models.fetchUser(id)(tx)) as User;
        if (!user) {
          return res.status(404).end();
        }
        return res.status(200).send({
          id: user.id,
          display_name: user.display_name,
          username: user.username,
        });
      } catch (e) {
        new Error(`Failed to fetch user ${id}`, { cause: e as Error });
        res.status(404).end();
      }
    });
  }
);
