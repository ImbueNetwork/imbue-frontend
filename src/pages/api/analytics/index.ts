import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  getUserAnalytics,
  insertUserAnalytics,
  updateUserAnalytics,
} from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { freelancer_id, user_id } = req.body;
      const InitialDetails: any = {
        user_id: freelancer_id,
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
        const userAnalytics = await getUserAnalytics(freelancer_id)(tx);
        const date1 = new Date();
        const date = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });
        if (
          date == 'Monday' &&
          userAnalytics &&
          userAnalytics.analytics['Monday'].date === date1.getDate()
        ) {
          const newCount = {
            analytics: {
              ...InitialDetails.analytics,
              [date]: {
                visitor: [...userAnalytics.analytics[date].visitor, user_id],
                count: userAnalytics.analytics[date].count + 1,
                date: date1.getDate(),
              },
            },
          };
          await updateUserAnalytics(freelancer_id, newCount)(tx);
        }
        if (date == 'Monday' && userAnalytics == undefined) {
          const newCount = {
            analytics: {
              ...InitialDetails,
              [date]: {
                visitor: [...userAnalytics.analytics[date].visitor, user_id],
                count: userAnalytics.analytics[date].count + 1,
                date: date1.getDate(),
              },
            },
          };
          await insertUserAnalytics(newCount)(tx);
        }

        if (userAnalytics == undefined) {
          const userAnalyticsDetails = {
            ...InitialDetails,
          };
          userAnalyticsDetails.analytics[date] = {
            visitor: [user_id],
            count: 1,
          };
          const userAnalyticsRes = await insertUserAnalytics(
            userAnalyticsDetails
          )(tx);
          return res.status(200).json(userAnalyticsRes);
        }
        const isAlreadyVisited =
          userAnalytics?.analytics[date].visitor.includes(user_id);
        if (!isAlreadyVisited && userAnalytics) {
          const newCount = {
            analytics: {
              ...userAnalytics.analytics,
              [date]: {
                ...userAnalytics.analytics[date],
                visitor: [...userAnalytics.analytics[date].visitor, user_id],
                count: userAnalytics.analytics[date].count + 1,
              },
            },
          };
          const userAnalyticsRes = await updateUserAnalytics(
            freelancer_id,
            newCount
          )(tx);
          return res.status(200).json(userAnalyticsRes);
        }
      });

      return res.status(201);
    } catch (cause) {
      return res.status(401).json(cause);
    }
  });
