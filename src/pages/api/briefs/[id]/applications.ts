import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, method } = req;

  const id: any = query.id as string[];

  if (method === "GET") {
    db.transaction(async (tx) => {
      try {
        const briefApplications = await models.fetchBriefApplications(id)(tx);

        const response = await Promise.all(
          briefApplications.map(async (application) => {
            return {
              ...application,
              freelancer: await models.fetchFreelancerDetailsByUserID(
                application.user_id
              )(tx),
              milestones: await models.fetchProjectMilestones(application.id)(
                tx
              ),
            };
          })
        );

        res.status(200).json(response);
      } catch (e) {
        new Error(`Failed to fetch brief applications with id ${id}`, {
          cause: e as Error,
        });
      }
    });
  } else {
    new Error(`Failed to fetch brief applications by userid: ${id}`);
  }
}
