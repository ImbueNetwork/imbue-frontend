import type { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import * as models from "../models";
import { Freelancer, fetchItems, searchFreelancers } from "../models";


import nextConnect from 'next-connect'

export default nextConnect()
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
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
  });
