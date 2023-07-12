// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    await db.transaction(async (tx) => {
      try {
        const users: User[] = (await models.fetchAllUser()(tx)) as User[];
        return res.status(201).send(users);
      } catch (e) {
        new Error(`Failed to fetch users`, { cause: e as Error });
      }
    });
  }
);
