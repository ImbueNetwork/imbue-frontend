import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import db from "../../db";
import * as models from "../../models";
import { Brief, BriefSqlFilter, fetchFreelancerDetailsByUsername, fetchItems } from "../../models";


export default nextConnect()
    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        const { id: username } = req.query;
        if (!username) return;
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
    });