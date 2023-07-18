/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';
import * as models from '../../../../lib/models';

export const authenticate = (
  method: string,
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      { session: false },
      (error: Error, token: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    )(req, res);
  });

export default nextConnect()
  .use(passport.initialize())
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const user: Partial<models.User> | any = req.body as Partial<models.User>;

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    const isAuthenticatedUer = userAuth?.id === user?.id;

    if (!isAuthenticatedUer) {
      return res.status(401).json({
        status: 'Failed',
        message: 'User is not authenticated.',
      });
    } else {
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
            const existingUsername = await models.fetchUserOrEmail(
              user.username
            )(tx);

            if (existingUsername?.id !== user?.id) {
              return res.status(400).json({
                status: 'Failed',
                message: 'Username already exists.',
              });
            }

            if (user.email) {
              const existingEmail = await models.fetchUserOrEmail(user.email)(
                tx
              );
              if (existingEmail?.id !== user?.id) {
                console.log('***** email already exists');
                return res.status(400).json({
                  status: 'Failed',
                  message: 'Email already exists.',
                });
              }
            }

            const userData = {
              id: user?.id,
              display_name: user?.display_name,
              username: user?.username,
              getstream_token: user.getstream_token,
              web3_address: user?.web3_address,
              profile_photo: user?.profile_photo,
              country: user?.country,
              region: user?.region,
              about: user?.about,
              website: user?.website,
              industry: user?.industry,
            };

            const userResp = await models.updateUserData(user.id, userData)(tx);
            if (!userResp) {
              return new Error('User not found!.');
            }

            response = userResp;
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
  });
