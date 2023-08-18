import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { wallet } = req.query;

        if (!wallet)
          return res.status(401).json({ message: 'No wallet found' });

        let projects = await models.getApproverProjects(wallet)(tx);

        projects = await Promise.all(
          projects.map(async (project) => {
            return {
              ...project,
              milestones: await models.fetchProjectMilestones(project.id)(tx),
            };
          })
        );

        return res.status(201).json(projects);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
