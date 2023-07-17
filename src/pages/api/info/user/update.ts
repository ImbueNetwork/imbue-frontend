/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';
import * as models from '../../../../lib/models';

export default nextConnect().put(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user: Partial<models.User> | any = req.body as Partial<models.User>;
    if (!user.id) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No user data provided.',
      });
    } else {
      verifyUserIdFromJwt(req, res, user.id);

      let response;
      await db.transaction(async (tx: any) => {
        try {

          const existingUsername = await models.fetchUserOrEmail(user.username)(tx);

          if (existingUsername?.id !== user?.id) {
            return res.status(400).json({
              status: 'Failed',
              message: 'Username already exists.',
            });
          }

          if(user.email) {
            const existingEmail =  await models.fetchUserOrEmail(user.email)(tx);
            if (existingEmail?.id !== user?.id) {
              console.log("***** email already exists");
              return res.status(400).json({
                status: 'Failed',
                message: 'Email already exists.',
              });
            }
          }


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
