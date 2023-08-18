import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  fetchFreelancerClients,
  fetchFreelancerMetadata,
  searchFreelancers,
} from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const filter: models.FreelancerSqlFilter = req.body;
        const freelancers = await searchFreelancers(filter)(tx);
        // const { currentData } = await models.paginatedData(
        //   filter?.page || 1,
        //   filter?.items_per_page || 5,
        //   freelancers
        // );
        const freelancerCount = await models.searchFreelancersCount(tx, {
          ...filter,
          items_per_page: 0,
        });

        await Promise.all([
          ...freelancers.map(async (freelancer: any) => {
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

        res.status(200).send({
          currentData: freelancers,
          totalFreelancers: freelancerCount,
          // totalFreelancers: 26,
        });
      } catch (e) {
        res.status(401).send({ currentData: null, totalFreelancers: null });
        throw new Error(`Failed to search all freelancers`, {
          cause: e as Error,
        });
      }
    });
  });
