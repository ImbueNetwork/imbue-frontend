/* eslint-disable @typescript-eslint/no-unused-vars */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

// FIXME:
export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, _res: NextApiResponse) => {
    let response;
    const projectId = req.query.applicationID;
    if (!projectId) return;

    await db.transaction(async (tx) => {
      try {
        const project = await models.fetchProject(projectId.toString())(tx);

        if (!project) {
          return project;
        }

        response = {
          ...project,
          milestones: await models.fetchProjectMilestones(projectId.toString())(
            tx
          ),
        };
      } catch (e) {
        new Error(`Failed to fetch projects for user id: ${projectId}`, {
          cause: e as Error,
        });
      }
    });
    return response;
  });
