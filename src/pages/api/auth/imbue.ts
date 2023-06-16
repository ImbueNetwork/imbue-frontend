import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';

import { jwtOptions } from './common';
import { setTokenCookie } from '../auth-cookies';
import * as models from '../models';
import { generateGetStreamToken, updateUserGetStreamToken } from '../models';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { userOrEmail, password } = req.body;
    db.transaction(async (tx) => {
      try {
        const user = await models.fetchUserOrEmail(userOrEmail)(tx);
        if (!user) {
          return res.status(404).end();
        }

        if (!user.getstream_token) {
          const token = await generateGetStreamToken(user);
          await updateUserGetStreamToken(user?.id, token)(tx);
        }
        const loginSuccessful = await bcrypt.compare(password, user.password);
        if (!loginSuccessful) {
          return res.status(404).end();
        }
        const payload = { id: user.id };
        const token = await jwt.sign(payload, jwtOptions.secretOrKey);
        await setTokenCookie(res, token);
        return res.send({ id: user.id, display_name: user.display_name });
      } catch (e) {
        new Error(`Failed to fetch user ${userOrEmail}`, { cause: e as Error });
      }
    });
  }
);
