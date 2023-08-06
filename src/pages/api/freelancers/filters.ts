import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const skills = await models.getFreelancerFilterItems('skill')(tx);
        const services = await models.getFreelancerFilterItems('service')(tx);
        
        res.status(200).json({
          skills,
          services,
        });
      } catch (e) {
        res.status(401).send({ currentData: null, totalFreelancers: null });
        throw new Error(`Failed to search all freelancers`, {
          cause: e as Error,
        });
      }
    });
  });
