// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import db from '@/db';

import * as models from '../../../models';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: userId, briefID } = req.query;

    if (userId === undefined)
      return res.status(401).send({ error: 'UserId not found' });
    if (briefID === undefined)
      return res.status(401).send({ error: 'BriefID not found' });

    let response;
    await db.transaction(async (tx) => {
      try {
        const project = await models.fetchUserBriefApplications(
          userId.toString(),
          briefID.toString()
        )(tx);
        if (!project) {
          return res.status(404).send({ error: 'Brief Application not found' });
        }
        response = {
          ...project,
          milestones: await models.fetchProjectMilestones(Number(project.id))(
            tx
          ),
        };
      } catch (e) {
        res.status(401).send(
          new Error(`Failed to fetch projects for user id: ${userId}`, {
            cause: e as Error,
          })
        );
      }
    });
    res.status(201).json(response);
  });
