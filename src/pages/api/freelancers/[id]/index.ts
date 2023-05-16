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
      const freelancer_profile = await tx
        .select("*")
        .from("freelancer_profile_image")
        .where({ freelancer_id: freelancer.id });
      if (freelancer_profile[0]) {
        freelancer.profile_image = freelancer_profile[0].profile_image;
      }

      const country = await tx
        .select("*")
        .from("freelancer_country")
        .where({ freelancer_id: freelancer.id });
      if (country[0]) {
        freelancer.country = country[0].country;
      }

      const region = await tx
        .select("*")
        .from("freelancer_country")
        .where({ freelancer_id: freelancer.id });
      if (region[0]) {
        freelancer.region = region[0].region;
      }

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
  const freelancer: models.Freelancer | any = body.freelancer;

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
          "clients"
        )(tx);
      }

      const profile_image = freelancer.profile_image;
      const country = freelancer.country;
      const region = freelancer.region;

      const freelancer_id = await models.updateFreelancerDetails(
        freelancer.user_id,
        freelancer,
        skill_ids,
        language_ids,
        client_ids,
        services_ids,
        profile_image,
        country,
        region
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
