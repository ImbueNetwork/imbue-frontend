import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";
import { User } from "@/model";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method } = req;

  const id: any = query.id;

  if (method === "GET") {
    db.transaction(async (tx) => {
      try {
        const user: User = (await models.fetchUser(id)(tx)) as User;
        if (!user) {
          return res.status(404).end();
        }
        res.send({
          id: user.id,
          display_name: user.display_name,
          username: user.username,
        });
      } catch (e) {
        new Error(`Failed to fetch user ${id}`, { cause: e as Error });
      }
    });
  }
}
