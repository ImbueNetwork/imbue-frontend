import type { NextApiRequest, NextApiResponse } from 'next'
import db from "../db";
import { fetchAllBriefs, fetchItems } from '../models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await db.transaction(async (tx) => {
    try {
      await fetchAllBriefs()(tx).then(async (briefs: any) => {
        await Promise.all([
          briefs,
          ...briefs.map(async (brief: any) => {
            brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
            brief.industries = await fetchItems(brief.industry_ids, "skills")(tx);
          })
        ]);
        res.status(200).json(briefs);

      });
    } catch (e) {
      new Error(
        `Failed to fetch all briefs`,
        { cause: e as Error }
      );
    }
  });
}
