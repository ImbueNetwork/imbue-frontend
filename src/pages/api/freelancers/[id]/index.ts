import { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";
import { fetchFreelancerDetailsByUsername, fetchItems } from "../../models";

export default async function freelancerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: username } = req.query;
  const { method, body } = req;
  if (!username) return;
  if (method === "PUT") {
    updateFreelancerDetailsProfile(body, res);
  } else if (method === "GET") {
    getFreelancerDetails(username, res);
  }
}

const getFreelancerDetails = (
  username: string | string[],
  res: NextApiResponse
) => {
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
      return res.status(200).json(freelancer);
    } catch (e) {
      new Error(`Failed to fetch freelancer details by username: ${username}`, {
        cause: e as Error,
      });
    }
  });
};

const updateFreelancerDetailsProfile = async (
  body: any,
  res: NextApiResponse
) => {
  const freelancer: models.Freelancer = body;

  console.log(freelancer);

  let response;
  await db.transaction(async (tx: any) => {
    try {
      const skill_ids = await models.upsertItems(
        freelancer.skills,
        "skills"
      )(tx);
      const language_ids = await models.upsertItems(
        freelancer.languages,
        "languages"
      )(tx);
      const services_ids = await models.upsertItems(
        freelancer.services,
        "services"
      )(tx);
      let client_ids: number[] = [];

      if (freelancer.clients) {
        client_ids = await models.upsertItems(
          freelancer.clients,
          "services"
        )(tx);
      }

      const freelancer_id = await models.updateFreelancerDetails(
        freelancer.user_id,
        freelancer,
        skill_ids,
        language_ids,
        client_ids,
        services_ids
      )(tx);

      if (!freelancer_id) {
        return res.status(401).send({
          status: "Failed",
          error: new Error("Failed to update freelancer details."),
        });
      }

      return res.status(201).send({
        status: "Successful",
        freelancer_id: freelancer_id,
      });
    } catch (e) {
      new Error(`Failed to update freelancer ${freelancer.display_name}`, {
        cause: e as Error,
      });
      console.log(e);
    }
  });
  return response;
};
