import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';

import * as models from '../../../../lib/models';

export default nextConnect().put(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user: Partial<models.User> | any = req.body as Partial<models.User>;
    if (!user.id) {
      res.status(400).json({
        status: 'Failed',
        message: 'No user data provided.',
      });
      return;
    } else {
      let response;
      await db.transaction(async (tx: any) => {
        try {
          const userData = await models.updateUserData(user.id, user)(tx);

          if (!userData) {
            return new Error('User not found!.');
          }

          response = userData;
        } catch (e) {
          new Error(`Failed to update user name: ${user.display_name}`, {
            cause: e as Error,
          });
          console.log(e);
        }
      });
      res.status(200).json({
        status: 'Successful',
        user: response,
      });
    }
  }
);
