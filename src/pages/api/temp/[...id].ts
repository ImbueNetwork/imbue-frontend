import { ProjectStatus } from '@/model';
import type { NextApiRequest, NextApiResponse } from 'next'
import next from 'next';
import db from "../db";
import * as models from "../models";
import { acceptBriefApplication, Brief, BriefSqlFilter, fetchFreelancerDetailsByUserID, fetchItems, fetchProject, fetchProjectMilestones, fetchUser, incrementUserBriefSubmissions, insertBrief, updateProject, upsertItems, User } from '../models';

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method } = req
  const id: any = query.id
  const name = query.name as string

  switch (method) {
    case 'GET':
      // Get data from your database
      const resp = await handleGet(id);
      if (resp) {
        res.status(200).json(resp);
      } else {
        res.status(404).end();
      }
      break
    case 'PUT':
      // Update or create data in your database
      res.status(200).json({ name: name || `User ${id}` })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export async function handleGet(routes: string[]) {
  const briefId = routes[0];
  switch (routes.length) {
    case 1:
      return await fetchBrief(briefId);
    case 2:
      switch (routes[1]) {
        case "applications":
          return await fetchBriefApplications(briefId);
      }
  }
}

export async function fetchBriefApplications(briefId: string) {
  let response
  await db.transaction(async (tx: any) => {
    try {
      const briefApplications = await models.fetchBriefApplications(briefId)(tx);


      if (!briefApplications) {
        return briefApplications
      }

      response = await Promise.all(briefApplications.map(async (application: any) => {
        return {
          ...application,
          freelancer: await fetchFreelancerDetailsByUserID(application.user_id)(tx),
          milestones: await fetchProjectMilestones(application.id)(tx)
        }
      }));

    } catch (e) {
      new Error(
        `Failed to fetch projects for user id: ${briefId}`,
        { cause: e as Error }
      );
    }
  });
  return response

}

export async function fetchBrief(briefId: string) {
  let response
  await db.transaction(async (tx: any) => {
    try {
      const brief = await models.fetchBrief(briefId)(tx);

      if (!brief) {
        return brief
      }

      await Promise.all([
        brief.skills = await fetchItems(brief.skill_ids, "skills")(tx),
        brief.industries = await fetchItems(brief.industry_ids, "industries")(tx),
      ]);

      response = brief

    } catch (e) {
      new Error(
        `Failed to fetch projects for user id: ${briefId}`,
        { cause: e as Error }
      );
    }
  });

  return response
}

export async function handlePost(routes: string[], req: NextApiRequest) {
  switch (routes.length) {
    case 1:
      return await createBrief(req);
    case 2:
      switch (routes[1]) {
        case "search":
          return await searchBriefs(req);
        case "status":
          return await updateStatus(req);
      }
  }
}

export async function createBrief(req: NextApiRequest) {
  const brief: Brief = req.body as Brief;
  let response
  await db.transaction(async (tx: any) => {
    try {
      const skill_ids = await upsertItems(brief.skills, "skills")(tx);
      const industry_ids = await upsertItems(brief.industries, "industries")(tx);
      const brief_id = await insertBrief(brief, skill_ids, industry_ids, brief.scope_id, brief.duration_id)(tx);
      if (!brief_id) {
        return new Error(
          "Failed to create brief."
        );
      }
      await incrementUserBriefSubmissions(brief.user_id)(tx);

      response = brief.id

    } catch (e) {
      new Error(
        `Failed to create brief for brief with name: ${brief.headline}`,
        { cause: e as Error }
      );
    }
  });

  return response
}

export async function searchBriefs(req: NextApiRequest) {
  let response
  const data: BriefSqlFilter = req.body;
  await db.transaction(async (tx: any) => {
    try {

      const briefs: Array<Brief> = await models.searchBriefs(tx, data);

      await Promise.all([
        briefs,
        ...briefs.map(async (brief: any) => {
          brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
          brief.industries = await fetchItems(brief.industry_ids, "skills")(tx);
        })
      ]);

      response = briefs

    } catch (e) {
      new Error(
        `Failed to search for briefs ${data}`,
        { cause: e as Error }
      );
    }
  });

  return response
}

export async function updateStatus(req: NextApiRequest) {
  const { query, method } = req
  let response

  if (!query?.id) return

  const id = query?.id[0];
  const projectId = req.body.project_id;
  const status_id = req.body.status_id;

  const data: BriefSqlFilter = req.body;
  await db.transaction(async (tx: any) => {
    try {
      let brief: Brief = await models.fetchBrief(id)(tx);
      if (!brief) {
        return new Error(
          "Brief does not exist."
        );
      }
      let briefOwner = await fetchUser(brief.user_id)(tx) as User;
      let project = await fetchProject(projectId)(tx);
      if (!project) {
        return project
      }
      project.status_id = status_id;
      await updateProject(project.id!, project)(tx);
      response = brief;

      if (status_id == ProjectStatus.Accepted) {
        let updatedBrief = await acceptBriefApplication(id, projectId)(tx);
        response = updatedBrief
      }

    } catch (e) {
      new Error(
        `Failed to search for briefs ${data}`,
        { cause: e as Error }
      );
    }
  });

  return response
}