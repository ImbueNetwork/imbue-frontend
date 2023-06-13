import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';

import * as models from '../../models';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id as string[];
    db.transaction(async (tx) => {
      try {
        const projects = await models.fetchUserProjects(id)(tx);
        if (!projects) {
          return res.status(404).end();
        }
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
