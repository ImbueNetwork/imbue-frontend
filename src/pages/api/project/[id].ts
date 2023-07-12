import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
  approvers?: string[];
};

export default nextConnect()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id as string[];

    db.transaction(async (tx) => {
      try {
        const project = await models.fetchProject(id)(tx);

        if (!project) {
          return res.status(404).end();
        }

        const milestones = await models.fetchProjectMilestones(id)(tx);
        const approvers = await models.fetchProjectApprovers(id)(tx);

        const pkg: ProjectPkg = {
          ...project,
          milestones,
          approvers: approvers.map(({ approver }: any) => approver),
        };

        return res.send(pkg);
      } catch (e) {
        new Error(`Failed to fetch project by id: ${id}`, {
          cause: e as Error,
        });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query, body } = req;
    const id: any = query.id as string[];
    const {
      name,
      logo,
      description,
      website,
      category,
      required_funds,
      currency_id,
      chain_project_id,
      owner,
      milestones,
      total_cost_without_fee,
      imbue_fee,
      user_id,
    } = body;
    db.transaction(async (tx) => {
      try {
        // ensure the project exists first
        const exists = await models.fetchProject(id)(tx);

        if (!exists) {
          return res.status(404).end();
        }

        if (exists.user_id !== user_id) {
          return res.status(403).end();
        }

        const project = await models.updateProject(id, {
          name,
          logo,
          description,
          website,
          category,
          chain_project_id,
          required_funds,
          currency_id,
          owner,
          total_cost_without_fee,
          imbue_fee,
          // project_type: exists.project_type,
        })(tx);

        if (!project.id) {
          return new Error('Cannot update milestones: `project_id` missing.');
        }

        // drop then recreate
        await models.deleteMilestones(id)(tx);

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(milestones, project.id)(tx),
        };

        return res.status(200).send(pkg);
      } catch (cause) {
        new Error(`Failed to update project.`, { cause: cause as Error });
      }
    });
  });
