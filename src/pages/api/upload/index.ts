import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { method1 } from '@/lib/upload';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    method1(req, res);
  });

export const config = {
  api: {
    bodyParser: false,
  },
};
