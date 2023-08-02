import Filter from 'bad-words';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../auth/common';
import { OffchainProjectState } from '@/model';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
  approvers?: string[];
};

export const authenticate = (
  method: string,
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      { session: false },
      (error: Error, token: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    )(req, res);
  });

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = id ? id[0] : '';
    const briefId = id ? id[1] : '';

    if (!projectId) return res.status(404).end();

    db.transaction(async (tx) => {
      try {
        let project;

        if (briefId)
          project = await models.fetchBriefProject(projectId, briefId)(tx);
        else project = await models.fetchProjectById(projectId)(tx);

        if (!project) {
          return res.status(404).end();
        }

        const milestones = await models.fetchProjectMilestones(projectId)(tx);
        const approvers = await models.fetchProjectApprovers(projectId)(tx);
        const pkg: ProjectPkg = {
          ...project,
          milestones,
          approvers: approvers.map(({ approver }: any) => approver),
        };

        return res.send(pkg);
      } catch (e) {
        return res.status(404).end();
        new Error(`Failed to fetch project by id: ${id}`, {
          cause: e as Error,
        });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const filter = new Filter();
    const { query, body } = req;
    const projectId = query?.id ? query.id[0] : null;
    // const brief_id: any = query.brief_id as string[];

    if (projectId === null) return res.status(404).end();
    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    db.transaction(async (tx) => {
      try {
        const projectApproverIds = await models.fetchProjectApproverUserIds(projectId)(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);
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
          escrow_address,
          duration_id,
          status_id,
        } = body;


        // ensure the project exists first
        const exists = await models.fetchProjectById(projectId)(tx);

        if (!exists) {
          return res.status(404).end();
        }

        if (exists.user_id !== user_id) {
          return res.status(403).end();
        }

        const project = await models.updateProject(projectId, {
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
          escrow_address,
          // project_type: exists.project_type,
          duration_id,
          status_id,
          completed: status_id == OffchainProjectState.Completed
        })(tx);

        if (!project.id) {
          return new Error('Cannot update milestones: `project_id` missing.');
        }

        // drop then recreate
        await models.deleteMilestones(projectId)(tx);

        //filtering milestones in back-end

        const filterdMileStone = milestones.map((item: any) => {
          return {
            ...item,
            name: filter.clean(item.name),
            description: filter.clean(item.description),
          };
        });

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(
            filterdMileStone,
            project.id
          )(tx),
        };

        return res.status(200).send(pkg);
      } catch (cause) {
        return res.status(401).json({ error: cause });
      }
    });
  });
