import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id as string[];
    const { skip, limit } = req.body;
    db.transaction(async (tx) => {
      try {
        const projects = await models.fetchUserOnGoingProjects(
          id,
          skip,
          limit
        )(tx);
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
