/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    await db.transaction(async (tx: any) => {
      try {
        await models
          .getBriefFilterItems('skill')(tx)
          .then(async (skills: any) => {
            res.status(200).json({ skills });
          });
      } catch (e) {
        new Error(`Failed to fetch skills`, { cause: e as Error });
      }
    });
  });
