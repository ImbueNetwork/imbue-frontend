import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, method } = req;

  const id: any = query.id as string[];

  if (method === "GET") {
    db.transaction(async (tx) => {
      try {
        const projects = await models.fetchUserProjects(id)(tx);
        if (!projects) {
          return res.status(404).end();
        }
        res.status(200).json(projects);
      } catch (e) {
        new Error(`Failed to fetch freelancer applications by userid: ${id}`, {
          cause: e as Error,
        });
      }
    });
  } else {
    new Error(`Failed to fetch freelancer applications by userid: ${id}`);
  }
}
