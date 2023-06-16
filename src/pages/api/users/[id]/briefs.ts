// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchBriefApplications,
  fetchProject,
  fetchProjectMilestones,
  fetchUserBriefs,
} from '@/lib/models';

import db from '@/db';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { query } = req;
      const userId: any = query.id as string[];
      if (userId) {
        await db.transaction(async (tx) => {
          try {
            const briefs = await fetchUserBriefs(userId)(tx);
            const pendingReviewBriefs = briefs.filter(
              (m) => m.project_id == null
            );
            const briefsWithProjects = briefs.filter(
              (m) => m.project_id !== null
            );
            const briefsUnderReview = await Promise.all(
              pendingReviewBriefs.map(async (brief) => {
                return {
                  ...brief,
                  number_of_applications: (
                    await fetchBriefApplications(brief.id)(tx)
                  ).length,
                };
              })
            );
            const acceptedBriefs = await Promise.all(
              briefsWithProjects.map(async (brief) => {
                return {
                  ...brief,
                  project: await fetchProject(brief.project_id)(tx),
                  milestones: await fetchProjectMilestones(brief.project_id)(
                    tx
                  ),
                };
              })
            );
            const response = {
              briefsUnderReview,
              acceptedBriefs,
            };

            res.status(200).json(response);
          } catch (e) {
            new Error(`Failed to fetch projects for user id: ${userId}`, {
              cause: e as Error,
            });
          }
        });
      } else {
        res.status(403);
      }
    } catch (error: any) {
      // FIXME:
      console.error(error);
      res.status(401).send(error.message);
    }
  });
