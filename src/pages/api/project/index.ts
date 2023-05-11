import { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import * as models from "../models";
import { authenticate } from "../info/user";

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
};

import nextConnect from 'next-connect'

export default nextConnect()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
    const {
      name,
      logo,
      description,
      website,
      category,
      required_funds,
      currency_id,
      owner,
      milestones,
      brief_id,
      total_cost_without_fee,
      imbue_fee,
    } = req.body;

    db.transaction(async (tx) => {
      try {
        const user = await authenticate("jwt", req, res);

        const project = await models.insertProject({
          name,
          logo,
          description,
          website,
          category,
          required_funds,
          currency_id,
          owner,
          user_id: (user as any).id,
          brief_id,
          total_cost_without_fee,
          imbue_fee,
        })(tx);

        if (!project?.id) {
          return new Error(
            "Failed to insert milestones: `project_id` missing."
          );
        }

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(milestones, project.id)(tx),
        };

        res.status(201).json(pkg);
      } catch (cause) {
        return new Error(`Failed to insert project.`, {
          cause: cause as Error,
        });
      }
    });

  });
