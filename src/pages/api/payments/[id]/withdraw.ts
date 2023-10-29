
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { fetchProjectById, fetchProjectMilestones } from '@/lib/models';
import { transfer } from '@/utils/multichain';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);

    await db.transaction(async (tx: any) => {
      try {
        const project = await fetchProjectById(Number(projectId))(tx);

        if (!project) {
          return res.status(404).end();
        }

        const milestones = await fetchProjectMilestones(projectId)(tx);

        const freelancerAddress = "0x2A6771f180F34E50A0b3301Bcb0A6CbF3804c037";

        const amountToWithdraw = milestones.filter(milestone => milestone.is_approved && !milestone.withdrawn)
          .reduce((sum, milestone) => sum + Number(milestone.amount), 0);

        transfer(projectId, project.currency_id, freelancerAddress, amountToWithdraw);
      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to withdraw funds for project id ${id}. Cause ${e}`,
        });
      }
    });
    return res.status(200).json("withdrawn");
  });