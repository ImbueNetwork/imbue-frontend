import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { Brief } from '@/model';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;

    const id: any = query.id as string[];

    db.transaction(async (tx) => {
      try {
        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        verifyUserIdFromJwt(req, res, [userAuth.id]);
        
        const brief : Brief = await models.fetchBrief(id)(tx);

        if (brief.user_id !== userAuth.id)
          return res.status(501).send({ message: 'unauthorized user' });

        const briefApplications = await models.fetchBriefApplications(id)(tx);

        const response = await Promise.all(
          briefApplications.map(async (application) => {
            return {
              ...application,
              freelancer: await models.fetchFreelancerDetailsByUserID(
                application.user_id
              )(tx),
              milestones: await models.fetchProjectMilestones(application.id)(
                tx
              ),
            };
          })
        );

        res.status(200).json(response);
      } catch (e) {
        new Error(`Failed to fetch brief applications with id ${id}`, {
          cause: e as Error,
        });
      }
    });
  }
);
