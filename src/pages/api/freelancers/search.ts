import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';
import {
  fetchFreelancerClients,
  fetchFreelancerMetadata,
  Freelancer,
  searchFreelancers,
} from '@/lib/models';

import db from '@/db';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const filter: models.FreelancerSqlFilter = req.body;
        const freelancers: Array<Freelancer> = await searchFreelancers(
          tx,
          filter
        );

        const { currentData } = await models.paginatedData(
          filter?.page || 1,
          filter?.items_per_page || 5,
          freelancers
        );
        await Promise.all([
          ...currentData.map(async (freelancer: any) => {
            freelancer.skills = await fetchFreelancerMetadata(
              'skill',
              freelancer.id
            )(tx);
            freelancer.services = await fetchFreelancerMetadata(
              'service',
              freelancer.id
            )(tx);
            freelancer.languages = await fetchFreelancerMetadata(
              'language',
              freelancer.id
            )(tx);
            freelancer.clients = await fetchFreelancerClients(freelancer.id)(
              tx
            );
          }),
        ]);

        res
          .status(200)
          .json({ currentData, totalFreelancers: freelancers.length });
      } catch (e) {
        new Error(`Failed to search all freelancers`, { cause: e as Error });
      }
    });
  }
);
