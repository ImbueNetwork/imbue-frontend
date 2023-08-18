import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

export default nextConnect()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const id: any = query.id;
    db.transaction(async (tx) => {
      try {
        const usernameRes: User = (
          await models.fetchUserWithUsernameOrAddress(id.toString())(tx)
        )[0] as User;

        if (!usernameRes) {
          return res.status(404).end();
        }

        const user: User = (
          await models.fetchUser(usernameRes?.id)(tx)
        )[0] as User;

        if (!user) {
          return res.status(404).end();
        }
        const web3Account = await models.fetchWeb3AccountByUserId(user?.id)(tx);

        return res.status(200).send({
          id: user.id,
          display_name: user.display_name,
          username: user.username,
          getstream_token: user.getstream_token,
          web3_address: web3Account?.address || null,
          profile_photo: user?.profile_photo,
          country: user.country,
          region: user.region,
          about: user.about,
          website: user.website,
          industry: user.industry,
          created: user.created,
        });
      } catch (e) {
        new Error(`Failed to fetch user ${id}`, { cause: e as Error });
        res.status(404).end();
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;

    const id: string[] = query.id as string[];
    const name = query.name as string;
    res.status(200).json({ name: name || `User ${id}` });
  });

export async function fetchProject(projectId: string) {
  let response;
  await db.transaction(async (tx) => {
    try {
      const project = await models.fetchProjectById(projectId)(tx);

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
            project: await models.fetchProjectById(brief.project_id)(tx),
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
      const user: User = (
        await models.fetchUser(Number(userId))(tx)
      )[0] as User;
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
