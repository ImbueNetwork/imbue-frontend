/* eslint-disable no-console */
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  fetchFreelancerClients,
  fetchFreelancerDetailsByUsername,
  fetchFreelancerMetadata,
  User,
} from '@/lib/models';
import { isUrlAndSpecialCharacterExist, isUrlExist } from '@/utils/helper';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';

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
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: username } = req.query;
    if (!username) return res.status(404).end();

    db.transaction(async (tx) => {
      try {
        let freelancer;
        freelancer = await fetchFreelancerDetailsByUsername(username)(tx);

        if (!freelancer?.id)
          freelancer = await models.fetchFreelancerDetailsByUserID(
            Number(username)
          )(tx);

        if (!freelancer) {
          return res.status(404).end();
        }

        await Promise.all([
          (freelancer.skills = await fetchFreelancerMetadata(
            'skill',
            freelancer.id
          )(tx)),
          (freelancer.languages = await fetchFreelancerMetadata(
            'language',
            freelancer.id
          )(tx)),
          (freelancer.services = await fetchFreelancerMetadata(
            'service',
            freelancer.id
          )(tx)),
          (freelancer.clients = await fetchFreelancerClients(freelancer.id)(
            tx
          )),
        ]);

        // await Promise.all([
        //        freelancer.skills = await fetchFreelancerMetadata("skill",freelancer.id)(tx);
        //        freelancer.services = await fetchFreelancerMetadata("service",freelancer.id)(tx);
        //        freelancer.languages = await fetchFreelancerMetadata("language",freelancer.id)(tx);
        //        freelancer.clients = await fetchFreelancerClients(freelancer.id)(tx);
        // ]);

        // await Promise.all([
        //   (freelancer.skills = await fetchItems(
        //     freelancer.skill_ids,
        //     'skills'
        //   )(tx)),
        //   (freelancer.client_images = await fetchItems(
        //     freelancer.client_ids,
        //     'clients'
        //   )(tx)),
        //   (freelancer.languages = await fetchItems(
        //     freelancer.language_ids,
        //     'languages'
        //   )(tx)),
        //   (freelancer.services = await fetchItems(
        //     freelancer.service_ids,
        //     'services'
        //   )(tx)),
        // ]);

        // const country = await tx
        //   .select('country')
        //   .from('freelancer_country')
        //   .where({ freelancer_id: freelancer.id })
        //   .first();

        // if (country) {
        //   freelancer.country = country;
        // }

        // const region = await tx
        //   .select('region')
        //   .from('freelancer_country')
        //   .where({ freelancer_id: freelancer.id })
        //   .first();

        // if (region) {
        //   freelancer.region = region;
        // }

        return res.status(200).json(freelancer);
      } catch (e) {
        new Error(
          `Failed to fetch freelancer details by username: ${username}`,
          {
            cause: e as Error,
          }
        );
        return res.status(401).json(e);
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const userAuth: Partial<User> | any = await authenticate('jwt', req, res);

    verifyUserIdFromJwt(req, res, [userAuth.id]);

    const freelancer: models.Freelancer | any = req.body.freelancer;
    const loggedInUser = req.body.freelancer.logged_in_user;

    if (!loggedInUser) {
      return res.status(401).send({
        status: 'Failed',
        error: new Error('You must be logged in to update your profile.'),
      });
    } else {
      let response;
      await db.transaction(async (tx: any) => {
        try {
          const skill_ids = freelancer.skills
            ? await models.upsertItems(freelancer.skills, 'skills')(tx)
            : [];

          const language_ids = freelancer.languages
            ? await models.upsertItems(
                freelancer.languages?.map((x: any) => x.name),
                'languages'
              )(tx)
            : [];

          const services_ids = freelancer.services
            ? await models.upsertItems(
                freelancer.services?.map((x: any) => x.name),
                'services'
              )(tx)
            : [];
          let client_ids: number[] = [];

          client_ids = freelancer.clients
            ? await models.upsertFreelancerClientsItems(
                freelancer.clients,
                'clients'
              )(tx)
            : [];

          const profile_image = freelancer.profile_image;
          const country = freelancer.country;
          const region = freelancer.region;
          const web3_address = freelancer.web3_address;
          const web3_type = freelancer.web3_type;
          const web3_challenge = freelancer.web3_challenge;
          const freelancer_clients = freelancer?.clients;
          const hour_per_rate = freelancer.hour_per_rate;
          // const token = await models.generateGetStreamToken(freelancer);
          await models.updateGetStreamUserName({
            ...userAuth,
            display_name: freelancer.display_name,
            username: freelancer.username,
            profile_photo: profile_image,
          });

          if (
            isUrlAndSpecialCharacterExist(freelancer.display_name) ||
            isUrlAndSpecialCharacterExist(freelancer.username) ||
            isUrlExist(freelancer.title)
          ) {
            return res.status(401).send({
              status: 'Failed',
              error: new Error('Failed to update freelancer details.'),
            });
          }

          const freelancer_id = await models.updateFreelancerDetails(
            freelancer.user_id,
            freelancer,
            skill_ids,
            language_ids,
            client_ids,
            services_ids,
            profile_image,
            country,
            region,
            web3_address,
            web3_type,
            web3_challenge,
            freelancer_clients,
            hour_per_rate
            // token
          )(tx);

          if (!freelancer_id) {
            return res.status(401).send({
              status: 'Failed',
              error: new Error('Failed to update freelancer details.'),
            });
          }

          return res.status(201).send({
            status: 'Successful',
            freelancer_id: freelancer_id,
          });
        } catch (e) {
          res.status(401).json({ message: 'Error: ' + e });
          throw new Error(
            `Failed to update freelancer ${freelancer.display_name}`,
            {
              cause: e as Error,
            }
          );
        }
      });
      return response;
    }
  });
