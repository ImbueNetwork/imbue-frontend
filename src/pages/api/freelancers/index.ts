import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import {
  fetchAllFreelancers,
  fetchItems,
  insertFreelancerDetails,
  paginatedData,
  upsertItems,
} from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../auth/common';

export default nextConnect()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query: data } = req;
    db.transaction(async (tx) => {
      try {
        await fetchAllFreelancers()(tx).then(async (freelancers: any) => {
          const { currentData, totalItems } = await paginatedData(
            Number(data?.page || 1),
            Number(data?.items_per_page || 5),
            freelancers
          );
          await Promise.all([
            ...currentData.map(async (freelancer: any) => {
              freelancer.skills = await fetchItems(
                freelancer.skill_ids,
                'skills'
              )(tx);
              freelancer.client_images = await fetchItems(
                freelancer.client_ids,
                'clients'
              )(tx);
              freelancer.languages = await fetchItems(
                freelancer.language_ids,
                'languages'
              )(tx);
              freelancer.services = await fetchItems(
                freelancer.service_ids,
                'services'
              )(tx);
            }),
          ]);

          res.status(200).json({ currentData, totalFreelancers: totalItems });
        });
      } catch (e) {
        new Error(`Failed to fetch all freelancers`, { cause: e as Error });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { body } = req;
    const freelancer = body.freelancer;

    verifyUserIdFromJwt(req, res, freelancer.user_id);
    db.transaction(async (tx) => {
      try {
        const skill_ids = await upsertItems(freelancer.skills, 'skills')(tx);
        const language_ids = await upsertItems(
          freelancer.languages,
          'languages'
        )(tx);
        const services_ids = await upsertItems(
          freelancer.services,
          'services'
        )(tx);
        let client_ids: number[] = [];

        if (freelancer.clients) {
          client_ids = await upsertItems(freelancer.clients, 'services')(tx);
        }
        const freelancer_id = await insertFreelancerDetails(
          freelancer,
          skill_ids,
          language_ids,
          client_ids,
          services_ids
        )(tx);

        if (!freelancer_id) {
          return res.status(401).send({
            status: 'Failed',
            error: new Error('Failed to insert freelancer details.'),
          });
        }

        return res.status(201).send({
          status: 'Successful',
          freelancer_id: freelancer_id,
        });
      } catch (cause) {
        return res.status(401).send({
          status: 'Failed',
          error: new Error(`Failed to insert freelancer details .`, {
            cause: cause as Error,
          }),
        });
      }
    });
  });
