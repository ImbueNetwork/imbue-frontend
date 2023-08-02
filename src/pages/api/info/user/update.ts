/* eslint-disable no-console */
import Filter from 'bad-words';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';
import * as models from '../../../../lib/models';
import { generateGetStreamToken } from '../../../../lib/models';

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
    const filter = new Filter({ placeHolder: ' ' });

    const user: Partial<models.User> | any = req.body as Partial<models.User>;

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    verifyUserIdFromJwt(req, res, userAuth.id);

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
        let response;
        await db.transaction(async (tx: any) => {
          try {
            const existingUser: any = await models.fetchUser(user.id)(tx);

            const existingUsername = await models.fetchUserOrEmail(
              existingUser[0]?.username
            )(tx);

            if (existingUsername?.id !== user?.id) {
              return res.status(409).send({
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

            if (filter.isProfane(user?.display_name)) {
              return res.status(400).json({
                status: 'Failed',
                message: 'Bad words are not allowed in display name',
              });
            }

            if (filter.isProfane(user?.username)) {
              return res.status(400).json({
                status: 'Failed',
                message: 'Bad words are not allowed in username name',
              });
            }
            const token = await generateGetStreamToken(user);
            const userData = {
              id: user?.id,
              display_name: user?.display_name,
              username: user?.username,
              getstream_token: token,
              web3_address: user?.web3_address,
              profile_photo: user?.profile_photo,
              country: user?.country,
              region: user?.region,
              about:
                user?.about && user.about.trim().length
                  ? filter.clean(user.about).trim()
                  : '',
              website:
                user?.website && user.website.trim().length
                  ? filter.clean(user.website).trim()
                  : '',
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
