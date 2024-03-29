import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import { setTokenCookie } from '@/lib/auth-cookies';
import * as models from '@/lib/models';
import { generateGetStreamToken, updateUserGetStreamToken } from '@/lib/models';

import db from '@/db';

import { jwtOptions } from './common';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { userOrEmail, password } = req.body;
    db.transaction(async (tx) => {
      try {
        const user = await models.fetchUserOrEmail(userOrEmail)(tx);
        if (!user) {
          return res.status(404).end();
        }
        const loginSuccessful = await bcrypt.compare(password, user.password);
        if (!loginSuccessful) {
          return res.status(404).end();
        }
        if (!user.getstream_token) {
          const token = await generateGetStreamToken(user);
          await updateUserGetStreamToken(user?.id, token)(tx);
        }

        // TODO: Remove this after all the users have profile photo in chat
        await models.updateGetStreamUserName(user);

        const payload = { id: user.id };
        const token = await jwt.sign(payload, jwtOptions.secretOrKey);
        await setTokenCookie(res, token);
        return res.send({ id: user.id, display_name: user.display_name });
      } catch (e) {
        res.status(500).json({ messahe: 'Error' });
        new Error(`Failed to fetch user ${userOrEmail}`, { cause: e as Error });
      }
    });
  }
);
