import Filter from 'bad-words';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import {
  countAllFreelancers,
  fetchAllFreelancers,
  fetchFreelancerClients,
  fetchFreelancerMetadata,
  freelancerProjects,
  insertFreelancerDetails,
  upsertItems,
} from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../auth/common';
export default nextConnect()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query: data } = req;
    db.transaction(async (tx) => {
      try {
        const offset =
          (Number(data?.page) - 1) * Number(data?.items_per_page) || 0;

        await fetchAllFreelancers()(tx)
          .offset(offset)
          .limit(Number(data?.items_per_page) || 100)
          .then(async (freelancers: any) => {
            const freelancerCount: any = await countAllFreelancers()(tx);

            //TODO Get all freelancers skills, and properties
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
                freelancer.clients = await fetchFreelancerClients(
                  freelancer.id
                )(tx);
                freelancer.projects = await freelancerProjects(freelancer.id)(
                  tx
                );
              }),
            ]);

            res.status(200).json({
              currentData: freelancers,
              totalFreelancers: freelancerCount[0].count,
              // totalFreelancers: 26,
            });
          });
      } catch (e) {
        res.status(401).json({
          currentData: null,
          totalFreelancers: null,
        });
        throw new Error(`Failed to fetch all freelancers`, {
          cause: e as Error,
        });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const filter = new Filter({ placeHolder: ' ' });
    const { body } = req;
    const freelancer = body.freelancer;

    verifyUserIdFromJwt(req, res, [freelancer.user_id]);
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
        const filterdData = {
          ...freelancer,
          about: filter.clean(freelancer.about).trim(),
          education: filter.clean(freelancer.education).trim(),
          skills: freelancer.skills.map((item: string) =>
            item.trim().length ? filter.clean(item).trim() : ''
          ),
          title: filter.clean(freelancer.title).trim(),
          languages: freelancer.languages.map((item: string) =>
            item.trim().length ? filter.clean(item).trim() : ''
          ),
          services: freelancer.services.map((item: string) =>
            item.trim().length ? filter.clean(item).trim() : ''
          ),
        };

        const freelancer_id = await insertFreelancerDetails(
          filterdData,
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
