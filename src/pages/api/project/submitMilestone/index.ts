import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex } = req.query;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        const projectApproverIds = await models.fetchProjectApproverUserIds(
          Number(projectId)
        )(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        const resp: any = await tx('milestone_attachments').select('*').where({
          project_id: projectId,
          milestone_index: milestoneIndex,
        });

        return res.status(201).json(resp);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId, milestoneIndex } = req.query;
        const fileURLS = req.body;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        const projectApproverIds = await models.fetchProjectApproverUserIds(
          Number(projectId)
        )(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        if (!fileURLS?.length)
          return res.status(401).json({ message: 'Nothing to upload' });

        const postReq = fileURLS.map((url: string) => ({
          project_id: projectId,
          milestone_index: milestoneIndex,
          fileURL: url,
          user_id: userAuth.id,
        }));

        const resp: any = await tx('milestone_attachments').insert(postReq);

        if (resp.rowCount > 0) {
          return res.status(201).json({
            message: `Uploaded ${fileURLS.length} attahments to milestone`,
          });
        } else {
          return res.status(401).json({
            status: 200,
            message: `Failed to upload files to database`,
          });
        }
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
