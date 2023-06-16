import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';
import {
  acceptBriefApplication,
  Brief,
  fetchBrief,
  fetchProject,
  fetchUser,
  updateProject,
  User,
} from '../../models';

export default nextConnect().put(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { body } = req;
    const { id }: any = req.query;

    const projectId = body?.project_id;
    const status_id = body?.status_id;

    db.transaction(async (tx) => {
      try {
        const brief: Brief = await fetchBrief(id)(tx);
        if (!brief) {
          return new Error('Brief does not exist.');
        }
        const briefOwner = (await fetchUser(brief.user_id)(tx)) as User;
        verifyUserIdFromJwt(req, res, briefOwner?.id);
        const project = await fetchProject(projectId)(tx);
        if (!project) {
          return new Error('Project does not exist.');
        }
        project.status_id = status_id;
        // FIXME:
        await updateProject(project.id ?? '', project)(tx);

        const updatedBrief = await acceptBriefApplication(id, projectId)(tx);
        return res.send(updatedBrief);
      } catch (e: any) {
        return new Error(`Failed to accept brief application: ${e.message}`);
      }
    });
  }
);
