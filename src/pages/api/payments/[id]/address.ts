
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { fetchProjectById } from '@/lib/models';
import { generateAddress } from '@/utils/multichain';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);
    let address;
    await db.transaction(async (tx: any) => {
      try {
        const project = await fetchProjectById(Number(projectId))(tx);

        if (!project) {
          return res.status(404).end();
        }

        if (project.currency_id < 100) {
          address = project.escrow_address;
        } else {
          address = await generateAddress(projectId, project.currency_id);
        }

      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to define address for project id ${id}. Cause ${e}`,
        });
      }
    });
    return res.status(200).json(address);
  });