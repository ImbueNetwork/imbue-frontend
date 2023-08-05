import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  fetchFreelancerClients,
  fetchFreelancerMetadata,
  Freelancer,
  searchFreelancers,
} from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../auth/common';

const authenticate = (
  method: string,
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      { session: false },
      (error: Error, token: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    )(req, res);
  });

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );
    await verifyUserIdFromJwt(req, res, [userAuth.id]);

    db.transaction(async (tx) => {
      try {
        const filter: models.FreelancerSqlFilter = req.body;
        const freelancers: Array<Freelancer> = await searchFreelancers(
          tx,
          filter
        );
        // const { currentData } = await models.paginatedData(
        //   filter?.page || 1,
        //   filter?.items_per_page || 5,
        //   freelancers
        // );
        const freelancerCount = await models.searchFreelancersCount(tx, filter);

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
        });
      } catch (e) {
        res.status(401).send({ currentData: null, totalFreelancers: null });
        new Error(`Failed to search all freelancers`, { cause: e as Error });
      }
    });
  });
