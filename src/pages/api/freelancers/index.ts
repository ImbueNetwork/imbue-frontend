import type { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import {
  fetchAllFreelancers,
  fetchItems,
  insertFreelancerDetails,
  upsertItems,
} from "../models";
import { verifyUserIdFromJwt } from "../auth/common";
import next from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body, method } = req;

  const freelancer = body.freelancer;

  if (method === "POST") {
    verifyUserIdFromJwt(req, res, next, freelancer.user_id);
    db.transaction(async (tx) => {
      try {
        const skill_ids = await upsertItems(freelancer.skills, "skills")(tx);
        const language_ids = await upsertItems(
          freelancer.languages,
          "languages"
        )(tx);
        const services_ids = await upsertItems(
          freelancer.services,
          "services"
        )(tx);
        let client_ids: number[] = [];

        if (freelancer.clients) {
          client_ids = await upsertItems(freelancer.clients, "services")(tx);
        }
        const freelancer_id = await insertFreelancerDetails(
          freelancer,
          skill_ids,
          language_ids,
          client_ids,
          services_ids
        )(tx);

        if (!freelancer_id) {
          return new Error("Failed to insert freelancer details.");
        }

        res.status(201).send({
          status: "Successful",
          freelancer_id: freelancer_id,
        });
      } catch (cause) {
        new Error(`Failed to insert freelancer details .`, {
          cause: cause as Error,
        });
      }
    });
  }

  if (method === "GET") {
    db.transaction(async (tx) => {
      try {
        await fetchAllFreelancers()(tx).then(async (freelancers: any) => {
          await Promise.all([
            ...freelancers.map(async (freelancer: any) => {
              freelancer.skills = await fetchItems(
                freelancer.skill_ids,
                "skills"
              )(tx);
              freelancer.client_images = await fetchItems(
                freelancer.client_ids,
                "clients"
              )(tx);
              freelancer.languages = await fetchItems(
                freelancer.language_ids,
                "languages"
              )(tx);
              freelancer.services = await fetchItems(
                freelancer.service_ids,
                "services"
              )(tx);
            }),
          ]);
          res.send(freelancers);
        });
      } catch (e) {
        new Error(`Failed to fetch all freelancers`, { cause: e as Error });
      }
    });
  }
}
