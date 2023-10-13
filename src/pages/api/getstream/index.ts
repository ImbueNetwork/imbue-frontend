import { connect } from 'getstream';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { target, title, briefId, type, text, applicationId } = req.body;
      const userAuth: Partial<models.User> | any = await authenticate(
        'jwt',
        req,
        res
      );
      const client = connect(
        process.env.GETSTREAM_API_KEY as string,
        process.env.GETSTREAM_SECRET_KEY as string
      );
      const targetUser = client.feed('user', target);
      const use = client.user(userAuth.id);

      db.transaction(async (tx) => {
        try {
          const user = (await models.fetchUser(userAuth.id)(tx)) as models.User;
          if (!user) {
            return res.status(404).end();
          }

          const activity = {
            actor: use,
            verb: 'pin',
            object: type,
            data: {
              sender: {
                display_name: user.display_name,
                profile_photo: user.profile_photo,
              },
              text,
              title,
              briefId,
              applicationId,
            },
          };
          await targetUser.addActivity(activity);
        } catch (err) {
          return res.status(404).end();
        }
      });

      // console.log(sender);

      res.status(200).json({ message: 'successfully send notification' });
    } catch (err) {
      console.log(err);
      res.status(500).send('unable to send notification: ');
    }
  });
