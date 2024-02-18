import { connect } from 'getstream';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  fetchUserByIdList,
  fetchUserByList,
} from '@/lib/queryServices/userQueries';
import { isValidAddressPolkadotAddress } from '@/utils/helper';

import db from '@/db';

import { authenticate } from '../auth/common';
import { sendMail } from '../webhook';

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
        process.env.GETSTREAM_SECRET_KEY as string,
        process.env.GETSTREAM_APP_ID as string
      );

      db.transaction(async (tx) => {
        try {
          const user = (await models.fetchUser(userAuth.id)(tx)) as models.User;
          if (!user) {
            return res.status(404).end();
          }
          const activity = {
            actor: 'User:' + user.id,
            verb: 'pin',
            object: type,
            data: {
              sender: {
                display_name: user.display_name,
                profile_photo: user.profile_photo,
                username: user.username,
              },
              text,
              title,
              briefId,
              applicationId,
            },
          };
          let userIdList: { id: string; email: string }[];
          if (isValidAddressPolkadotAddress(target[0])) {
            const response = (await fetchUserByList(target)(
              tx
            )) as models.User[];
            userIdList = response.map((user: models.User) => {
              return {
                id: String(user.id),
                email: user.email,
                name: user.display_name,
              };
            });
          } else {
            const response = (await fetchUserByIdList(target)(
              tx
            )) as models.User[];
            userIdList = response.map((user: models.User) => {
              return {
                id: String(user.id),
                email: user.email,
                name: user.display_name,
              };
            });
          }

          userIdList.map(async ({ id, email }) => {
            const userId = client.user(String(id));
            const targetUser = client.feed(
              'user',
              String(userId.id),
              userId.token
            );

            const msg = {
              to: email,
              from: 'info@imbue.network', // Use the email address or domain you verified above
              subject: title,
              text: 'imbue@Network.com',
              html: text,
            };
            await sendMail.send(msg);

            await targetUser.addActivity(activity);
          });
        } catch (err) {
          return res.status(404).end();
        }
      });
      res.status(200).json({ message: 'successfully send notification' });
    } catch (err) {
      res.status(500).send('unable to send notification: ');
    }
  });
