import type { NextApiRequest, NextApiResponse } from "next";
import db from "../db";
import {
  fetchAllBriefs,
  fetchItems,
  incrementUserBriefSubmissions,
  upsertItems,
  insertBrief,
} from "../models";
import { BriefSqlFilter } from "@/model";
import * as models from "../models";
import { Brief } from "@/model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await db.transaction(async (tx: any) => {
      try {
        await fetchAllBriefs()(tx).then(async (briefs: any) => {
          await Promise.all([
            briefs,
            ...briefs.map(async (brief: any) => {
              brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
              brief.industries = await fetchItems(
                brief.industry_ids,
                "industries"
              )(tx);
            }),
          ]);
          res.status(200).json(briefs);
        });
      } catch (e) {
        new Error(`Failed to fetch all briefs`, { cause: e as Error });
      }
    });
  } else if (req.method === "POST") {
    const response = await createBrief(req);
    res.status(200).json({
      status: "Successful",
      brief_id: response,
    });
  } else if (req.method === "PUT") {
    const response = await updateBrief(req);
    res.status(200).json({
      status: "Successful",
      brief_id: response,
    });
  }
}

export async function createBrief(req: NextApiRequest) {
  const brief: Brief = req.body as Brief;
  let response;
  await db.transaction(async (tx: any) => {
    try {
      const skill_ids = await upsertItems(brief.skills, "skills")(tx);
      const industry_ids = await upsertItems(
        brief.industries,
        "industries"
      )(tx);
      const brief_id = await insertBrief(
        brief,
        skill_ids,
        industry_ids,
        brief.scope_id,
        brief.duration_id
      )(tx);
      if (!brief_id) {
        return new Error("Failed to create brief.");
      }
      await incrementUserBriefSubmissions(brief.user_id)(tx);

      response = brief_id;
    } catch (e) {
      new Error(
        `Failed to create brief for brief with name: ${brief.headline}`,
        { cause: e as Error }
      );
      console.log(e);
    }
  });
  return response;
}

export async function updateBrief(req: NextApiRequest) {
  const brief: Brief = req.body as Brief;
  let response;
  await db.transaction(async (tx: any) => {
    try {
      const skill_ids = await upsertItems(brief.skills, "skills")(tx);
      const industry_ids = await upsertItems(
        brief.industries,
        "industries"
      )(tx);

      const brief_id = await models.updateBrief(
        brief.headline,
        brief.description,
        brief.scope_id,
        brief.experience_id,
        brief.duration_id,
        brief.budget,
        brief.id,
        skill_ids,
        industry_ids
      )(tx);

      if (!brief_id) {
        return new Error("Failed to update brief.");
      }

      response = brief_id;
    } catch (e) {
      new Error(
        `Failed to update brief for brief with name: ${brief.headline}`,
        { cause: e as Error }
      );
      console.log(e);
    }
  });
  return response;
}
