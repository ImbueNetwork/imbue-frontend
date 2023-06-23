import { NextApiRequest, NextApiResponse } from 'next';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate } from '../info/user';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
};

import nextConnect from 'next-connect';

export default nextConnect().post(
  async (req: NextApiRequest, res: NextApiResponse) => {
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
        const user: any = await authenticate('jwt', req, res);
        const freelancer: any = await models.fetchFreelancerDetailsByUserID(
          user.id
        )(tx);

        if (!freelancer?.verified) {
          return res
            .status(401)
            .send('Only verified freelancers can apply for a brief');
        }

        const project = await models.insertProject({
          name,
          logo,
          description,
          website,
          category,
          required_funds,
          currency_id,
          owner,
          user_id: user.id,
          brief_id,
          total_cost_without_fee,
          imbue_fee,
        })(tx);

        if (!project?.id) {
          return new Error('project_id missing.');
        }

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(milestones, project.id)(tx),
        };

        return res.status(201).json(pkg);
      } catch (cause) {
        return res.status(500).send('Failed to insert project');
      }
    });
  }
);
