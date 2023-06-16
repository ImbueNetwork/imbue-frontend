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
        const web3Account = await models.fetchWeb3AccountByUserId(id)(tx);
        if (!user) {
          return res.status(404).end();
        }
        return res.status(200).send({
          id: user.id,
          display_name: user.display_name,
          username: user.username,
          getstream_token: user.getstream_token,
          web3_address: web3Account?.address || null,
          profile_image: user.profile_photo,
          country: user.country,
          region: user.region,
          about: user.about,
          website: user.website,
          industry: user.industry,
        });
      } catch (e) {
        new Error(`Failed to fetch user ${id}`, { cause: e as Error });
        res.status(404).end();
      }
    });
  }
);
