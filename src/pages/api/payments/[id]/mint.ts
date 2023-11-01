
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { mintTokens } from '@/utils/multichain';

import { BasicTxResponse } from '@/model';


export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);
    const { beneficiary } = req.body;
    try {
      const result: BasicTxResponse = await mintTokens(projectId, beneficiary);
      if (!result.txError) {
        return res.status(200).json(result);
      }
      return res.status(501).end(result);
    } catch (e: any) {
      return res.status(501).json(e.message);
    }
  });
