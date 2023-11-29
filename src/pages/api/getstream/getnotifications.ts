import { connect } from 'getstream';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const userAuth: Partial<models.User> | any = await authenticate(
        'jwt',
        req,
        res
      );

      if (!userAuth) {
        return res.status(404).send('unable to fetch notifications');
      }

      const client = connect(
        process.env.GETSTREAM_API_KEY as string,
        process.env.GETSTREAM_SECRET_KEY as string
      );

      const user = client.feed('user', userAuth.id);
      await db.transaction(async (tx) => {
        try {
          const { last_notification_id } =
            await models.fetchUserLastNotificationId(Number(userAuth.id))(tx);
          if (last_notification_id) {
            const result = await user.get({
              limit: 20,
              id_gt: last_notification_id,
            });
            return res.status(200).json({
              message: 'successfully send notification',
              new_notification: result.results,
            });
          } else if (!last_notification_id) {
            const result = await user.get({
              limit: 20,
            });
            return res.status(200).json({
              message: 'successfully send notification',
              new_notification: result.results,
            });
          }
        } catch (e) {
          new Error(`Failed to fetch user notifications`, {
            cause: e as Error,
          });
          return res.status(404).send('unable to fetch notifications');
        }
      });
    } catch (err) {
      return res.status(404).end('unable to fetch notifications');
    }
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { notificationId } = req.body;
      const userAuth: Partial<models.User> | any = await authenticate(
        'jwt',
        req,
        res
      );
      await db.transaction(async (tx) => {
        try {
          await models.updateUserLastNotificationId(
            userAuth.id,
            notificationId
          )(tx);
        } catch (err) {
          console.log(err);
        }
      });
      res.status(200).json('working');
    } catch (err) {
      console.log(err);
      res.status(500).send('unable to update');
    }
  });
