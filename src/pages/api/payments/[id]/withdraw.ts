
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { withdraw } from '@/utils/multichain';


export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);
    try {
      const coverFees = true;
      const withdrawnAmount = await withdraw(projectId, coverFees);
      if (withdrawnAmount > 0) {
        return res.status(200).json({ WithdrawnAmount: withdrawnAmount });
      } else {
        return res.status(501).json({ WithdrawnAmount: 0 });
      }
    } catch (e: any) {
      return res.status(501).json(e.message);
    }
  });
