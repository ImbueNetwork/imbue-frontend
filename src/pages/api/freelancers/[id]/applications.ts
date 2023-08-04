import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id as string[];
    db.transaction(async (tx) => {
      try {
        let projects = await models.fetchUserProjects(id)(tx);
        if (!projects) {
          return res.status(404).end();
        }

        projects = await Promise.all(
          projects.map(async (project) => {
            return {
              ... project,
              milestones: await models.fetchProjectMilestones(
                project.id
              )(tx)
            }
           
          })
        );

        return res.status(200).json(projects);
      } catch (e) {
        new Error(`Failed to fetch freelancer applications by userid: ${id}`, {
          cause: e as Error,
        });
        return res.status(404).end();
      }
    });
  }
);
