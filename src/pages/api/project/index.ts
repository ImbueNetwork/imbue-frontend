import { NextApiRequest, NextApiResponse } from 'next';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate } from '../info/user';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
};

import nextConnect from 'next-connect';

import { verifyUserIdFromJwt } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
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
      duration_id,
      verified_only,
      payment_address,
      // project_type,
    } = req.body;

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    verifyUserIdFromJwt(req, res, [userAuth.id]);

    db.transaction(async (tx) => {
      try {
        const user: any = await authenticate('jwt', req, res);
        const freelancer: any = await models.fetchFreelancerDetailsByUserID(
          user.id
        )(tx);

        if (!freelancer?.verified && verified_only) {
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
          duration_id,
          payment_address,
          // project_type: project_type ?? models.ProjectType.Brief
        })(tx);

        if (!project?.id) {
          return res.status(401).send(new Error('project_id missing.'));
        }

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(milestones, project.id)(tx),
        };

        return res.status(201).json(pkg);
      } catch (cause) {
        console.log(cause);
        return res.status(401).json(cause);
      }
    });
  });
