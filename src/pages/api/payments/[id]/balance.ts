
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { getBalance } from '@/utils/multichain';


export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);
    const projectBalance = await getBalance(projectId);
    if (projectBalance == undefined) {
      return res.status(404).end();
    }
    return res.status(200).json(projectBalance);
  });


