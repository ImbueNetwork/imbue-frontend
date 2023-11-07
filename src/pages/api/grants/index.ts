import Filter from 'bad-words';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchAllGrants,
  fetchProjectById,
  Grant,
  insertGrant,
  paginatedData,
  User,
} from '@/lib/models';
import { updateProject } from '@/lib/models';
import { MultiChainService } from '@/utils/multichain';

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
    const multichain = await MultiChainService.build();

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
            chain_project_id: grant.chain_project_id.toString(),
          })),
        };

        const grantId = await insertGrant(filterdGrants)(tx);
        if (grant.currency_id >= 100) {
          const offchainEscrowAddress = await multichain.generateAddress(Number(grantId), grant.currency_id);
          const grantAsProject = await fetchProjectById(Number(grantId))(tx);
          if (grantAsProject) {
            grantAsProject.escrow_address = offchainEscrowAddress;
            await updateProject(Number(grantAsProject.id), grantAsProject)(tx);
          }
        }
        res.status(200).json({ status: 'Success', grant_id: grantId });

      } catch (e) {
        res.status(401).json({ message: 'Failed to insert grant' + e });
        throw new Error('success to insert a new grant.', { cause: e as Error });
      }
    });
  });
