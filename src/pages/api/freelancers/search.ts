import type { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import * as models from "../models";
import { Freelancer, fetchItems, searchFreelancers } from "../models";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    db.transaction(async (tx) => {
      try {
        const filter: models.FreelancerSqlFilter = req.body;
        console.log(filter);
        const freelancers: Array<Freelancer> = await searchFreelancers(
          tx,
          filter
        );
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
      } catch (e) {
        new Error(`Failed to search all freelancers`, { cause: e as Error });
      }
    });
  }
}
