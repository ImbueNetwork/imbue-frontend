import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

export default nextConnect().put(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;

    const id: string[] = query.id as string[];
    const name = query.name as string;
    res.status(200).json({ name: name || `User ${id}` });
  }
);

export async function fetchProject(projectId: string) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const project = await models.fetchProject(projectId)(tx);

      if (!project) {
        return project;
      }

      response = {
        ...project,
        milestones: await models.fetchProjectMilestones(projectId)(tx),
      };
    } catch (e) {
      new Error(`Failed to fetch projects for user id: ${projectId}`, {
        cause: e as Error,
      });
    }
  });
  return response;
}

export async function fetchUserBriefApplications(
  userId: string,
  briefId: string
) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const project = await models.fetchUserBriefApplications(
        userId,
        briefId
      )(tx);

      if (!project) {
        return project;
      }

      response = {
        ...project,
        milestones: await models.fetchProjectMilestones(Number(project.id))(tx),
      };
    } catch (e) {
      new Error(`Failed to fetch projects for user id: ${userId}`, {
        cause: e as Error,
      });
    }
  });
  return response;
}

export async function fetchAllUserBriefs(userId: string) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const briefs = await models.fetchUserBriefs(userId)(tx);
      const pendingReviewBriefs = briefs.filter((m) => m.project_id == null);
      const briefsWithProjects = briefs.filter((m) => m.project_id !== null);

      const briefsUnderReview = await Promise.all(
        pendingReviewBriefs.map(async (brief) => {
          return {
            ...brief,
            number_of_applications: (
              await models.fetchBriefApplications(brief.id)(tx)
            ).length,
          };
        })
      );

      const acceptedBriefs = await Promise.all(
        briefsWithProjects.map(async (brief) => {
          return {
            ...brief,
            project: await models.fetchProject(brief.project_id)(tx),
            milestones: await models.fetchProjectMilestones(brief.project_id)(
              tx
            ),
          };
        })
      );

      response = {
        briefsUnderReview,
        acceptedBriefs,
      };
    } catch (e) {
      new Error(`Failed to fetch projects for user id: ${userId}`, {
        cause: e as Error,
      });
    }
  });
  return response;
}

export async function fetchUserById(userId: string) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const user: User = (await models.fetchUser(Number(userId))(tx)) as User;
      if (user) {
        response = {
          id: user.id,
          display_name: user.display_name,
          username: user.username,
        };
      }
    } catch (e) {
      new Error(`Failed to fetch user ${userId}`, { cause: e as Error });
    }
  });
  return response;
}

export async function fetchUserByUsernameOrEmail(userOrEmail: string) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const user: User = (await models.fetchUserOrEmail(userOrEmail)(
        tx
      )) as User;
      if (user) {
        response = {
          id: user.id,
          display_name: user.display_name,
          username: user.username,
        };
      }
    } catch (e) {
      new Error(`Failed to fetch user ${userOrEmail}`, { cause: e as Error });
    }
  });
  return response;
}
