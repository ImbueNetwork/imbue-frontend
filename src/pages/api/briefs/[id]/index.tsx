import { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import * as models from "../../models";
import { Brief, BriefSqlFilter, fetchItems } from '../../models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: briefId, applications } = req.query;

  let response

  if(briefId==="search"){
    const result = await searchBriefs(req)
    
    return res.status(200).json(result)
  }

  if (!briefId) return
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

      if (applications === "true") {
        const applicationList = await fetchBriefApplications(briefId)
        response = { ...response, applications: applicationList };
      }

    } catch (e) {
      new Error(
        `Failed to fetch projects for user id: ${briefId}`,
        { cause: e as Error }
      );
    }
  });
  res.status(200).json(response)
}

export async function fetchBriefApplications(briefId: string | string[]) {
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
          freelancer: await models.fetchFreelancerDetailsByUserID(application.user_id)(tx),
          milestones: await models.fetchProjectMilestones(application.id)(tx)
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

export async function searchBriefs(req: NextApiRequest) {
  let response
  const data = req.body as BriefSqlFilter;
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