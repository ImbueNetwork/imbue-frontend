// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { userName } = req.query;

    if (userName === undefined)
      return res.status(401).send({ error: 'Username of Email not found' });

    await db.transaction(async (tx) => {
      try {
        const user: User = (
          await models.fetchUserWithUsernameOrAddress(userName.toString())(tx)
        )[0] as User;

       // if (!user) return res.status(401).send({ error: 'No user found' });

        return res.status(201).send(user);
      } catch (e) {
        new Error(`Failed to fetch user ${userName}`, {
          cause: e as Error,
        });
      }
    });
  }
);
