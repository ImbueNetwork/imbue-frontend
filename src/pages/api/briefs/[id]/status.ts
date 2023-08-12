import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  acceptBriefApplication,
  Brief,
  fetchBrief,
  fetchProjectById,
  fetchUser,
  ProjectStatus,
  rejectOtherApplications,
  updateProject,
  User,
} from '@/lib/models';

import db from '@/db';

import { verifyUserIdFromJwt } from '../../auth/common';

const authenticate = (
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
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { body } = req;
    const { id }: any = req.query;

    const projectId = body?.project_id;
    const status_id = body?.status_id;

    const userAuth: Partial<User> | any = await authenticate('jwt', req, res);

    verifyUserIdFromJwt(req, res, [userAuth.id]);

    db.transaction(async (tx) => {
      try {
        const brief: Brief = await fetchBrief(id)(tx);
        if (!brief) {
          return new Error('Brief does not exist.');
        }
        const briefOwner = (await fetchUser(brief.user_id)(tx))[0] as User;
        verifyUserIdFromJwt(req, res, [briefOwner?.id]);
        const project = await fetchProjectById(projectId)(tx);
        if (!project) {
          return new Error('Project does not exist.');
        }
        project.status_id = status_id;
        // FIXME:
        await updateProject(project.id ?? '', project)(tx);

        if (status_id == ProjectStatus.Accepted) {
          await rejectOtherApplications(id, projectId)(tx);

          const updatedBrief = await acceptBriefApplication(id, projectId)(tx);
          return res.send(updatedBrief);
        } else {
          return res.send(brief);
        }
      } catch (e: any) {
        return new Error(`Failed to accept brief application: ${e.message}`);
      }
    });
  });
