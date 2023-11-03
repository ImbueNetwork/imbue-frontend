import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { getUserAnalytics, insertUserAnalytics } from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { user_id } = req.body;

      const InitialDetails: any = {
        user_id: user_id,
        analytics: {
          Monday: {
            visitor: [],
            count: 0,
            date: 0,
          },
          Tuesday: {
            visitor: [],
            count: 0,
          },
          Wednesday: {
            visitor: [],
            count: 0,
          },
          Thursday: {
            visitor: [],
            count: 0,
          },
          Friday: {
            visitor: [],
            count: 0,
          },
          Saturday: {
            visitor: [],
            count: 0,
          },
          Sunday: {
            visitor: [],
            count: 0,
          },
        },
      };
      db.transaction(async (tx) => {
        const userAnalytics = await getUserAnalytics(user_id)(tx);
        if (userAnalytics) return res.status(200).send(userAnalytics);
        const userAnalyticRes = await insertUserAnalytics(InitialDetails)(tx);
        return res.status(200).send(userAnalyticRes);
      });
    } catch (err) {
      return res.send(err);
    }
  });
