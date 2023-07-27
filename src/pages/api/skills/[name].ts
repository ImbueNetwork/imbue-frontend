/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

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
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    await db.transaction(async (tx: any) => {
      try {
        const { name } = req.query;

        if (!name) {
          return res.status(404);
        }
        await models
          .searchImbueSkillsByName(String(name))(tx)
          .then(async (skills: any) => {
            res.status(200).json({ skills });
          });
      } catch (e) {
        new Error(`Failed to fetch skills`, { cause: e as Error });
      }
    });
  });
