import Filter from 'bad-words';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchAllGrants,
  Grant,
  insertGrant,
  paginatedData,
  User,
} from '@/lib/models';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const data = req.query;

    await db.transaction(async (tx: any) => {
      try {
        await fetchAllGrants()(tx).then(async (grants: any) => {
          const { currentData, totalItems } = paginatedData(
            Number(data?.page || 1),
            Number(data?.items_per_page || 5),
            grants
          );
          res.status(200).json({
            currentData,
            totalItems,
          });
        });
      } catch (e) {
        new Error(`Failed to fetch all briefs`, { cause: e as Error });
      }
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const grant: Grant = req.body as Grant;
    const filter = new Filter();
    const userAuth: Partial<User> | any = await authenticate('jwt', req, res);
    verifyUserIdFromJwt(req, res, [userAuth.id]);
    await db.transaction(async (tx: any) => {
      try {
        const filterdGrants = {
          ...grant,
          title: filter.clean(grant.title),
          description: filter.clean(grant.description),
          milestones: grant.milestones.map((milestone) => ({
            ...milestone,
            name: filter.clean(milestone.name),
            description: filter.clean(milestone.description),
          })),
        };

        const grant_id = await insertGrant(filterdGrants)(tx);
        res.status(200).json({ status: 'Success', grant_id });
      } catch (e) {
        throw new Error('Failed to insert a new grant.', { cause: e as Error });
      }
    });
  });
