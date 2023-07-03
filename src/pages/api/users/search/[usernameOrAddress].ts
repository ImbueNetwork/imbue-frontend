// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { usernameOrAddress } = req.query;

    if (usernameOrAddress === undefined)
      return res.status(401).send({ error: 'Username of Email not found' });

    await db.transaction(async (tx) => {
      try {
        const users: User[] = (await models.fetchUserWithUsernameOrAddress(
          usernameOrAddress.toString()
        )(tx)) as User[];

        if (!users) return res.status(401).send({ error: 'No user found' });

        return res.status(201).send(users);
        
      } catch (e) {
        new Error(`Failed to fetch user ${usernameOrAddress}`, {
          cause: e as Error,
        });
      }
    });
  }
);
