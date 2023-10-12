import { connect } from 'getstream';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import { authenticate } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { target, briefId, type, text } = req.body;
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
      const activity = {
        actor: use,
        verb: 'pin',
        object: 'notifications',
        data: {
          type: type,
          sender: userAuth,
          text,
          briefId,
        },
      };

      //await targetUser.addActivity(activity);
      res.status(200).json({ message: 'successfully send notification' });
    } catch (err) {
      console.log(err);
      res.status(500).send('unable to send notification: ');
    }
  });
