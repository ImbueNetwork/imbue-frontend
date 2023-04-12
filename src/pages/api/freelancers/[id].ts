import type { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import {
  fetchFreelancerDetailsByUsername,
  fetchItems,
  insertFreelancerDetails,
  upsertItems,
} from "../models";
import { validateUserFromJwt, verifyUserIdFromJwt } from "../auth/common";
import next from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, body, method } = req;
  const freelancer = body.freelancer;

  const username: any = query.id as string[];

  if (method === "GET") {
    db.transaction(async (tx) => {
      try {
        const freelancer = await fetchFreelancerDetailsByUsername(username)(tx);

        if (!freelancer) {
          return res.status(404).end();
        }

        await Promise.all([
          (freelancer.skills = await fetchItems(
            freelancer.skill_ids,
            "skills"
          )(tx)),
          (freelancer.client_images = await fetchItems(
            freelancer.client_ids,
            "clients"
          )(tx)),
          (freelancer.languages = await fetchItems(
            freelancer.language_ids,
            "languages"
          )(tx)),
          (freelancer.services = await fetchItems(
            freelancer.service_ids,
            "services"
          )(tx)),
        ]);

        // Used to show/hide edit buttons if the correct user.
        if (validateUserFromJwt(req, res, next, freelancer.user_id)) {
          res.setHeader("Set-Cookie", "isUser=true; Path=/; HttpOnly; Secure");
        } else {
          res.setHeader("Set-Cookie", "isUser=false; Path=/; HttpOnly; Secure");
        }

        res.status(200).json(freelancer);
      } catch (e) {
        new Error(
          `Failed to fetch freelancer details by username: ${username}`,
          { cause: e as Error }
        );
      }
    });
  }
  if (method === "PUT") {
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
}
