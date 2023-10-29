
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { fetchProjectById } from '@/lib/models';
import { getBalance } from '@/utils/multichain';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    let projectBalance;
    const projectId = Number(id);
    await db.transaction(async (tx: any) => {
      try {
        const project = await fetchProjectById(Number(projectId))(tx);
        if (!project) {
          return res.status(404).end();
        }
        projectBalance = await getBalance(projectId, project.currency_id);
      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to retreive balance project id ${id}. Cause ${e}`,
        });
      }
    });

    if (projectBalance == undefined) {
      return res.status(404).end();
    }
    return res.status(200).json(projectBalance);
  });