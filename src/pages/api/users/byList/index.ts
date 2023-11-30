import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

// import * as models from '@/lib/models';
import { fetchUserByList } from '@/lib/queryServices/userQueries';

import db from '@/db';
import { User } from '@/model';

//import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const walletList = req.body;

    db.transaction(async (tx) => {
      try {
        // const userAuth: Partial<models.User> | any = await authenticate(
        //   'jwt',
        //   req,
        //   res
        // );

        //verifyUserIdFromJwt(req, res, [userAuth.id]);

        const users = (await fetchUserByList(walletList)(tx)) as User[];

        const existinAccounts = users.map((user) => user.web3_address);

        walletList.forEach((wallet: string) => {
          if (!existinAccounts.includes(wallet))
            users.push({
              id: 0,
              display_name: '',
              profile_photo: '',
              username: '',
              web3_address: wallet,
              getstream_token: '',
              email: '',
            });
        });

        if (!users?.length) {
          return res.status(404).end();
        }
        return res.status(200).send(users);
      } catch (e) {
        // new Error(`Failed to fetch user ${id}`, { cause: e as Error });
        res.status(404).end();
      }
    });
  }
);
