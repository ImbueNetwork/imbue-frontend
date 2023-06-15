import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db";
import * as models from "@/lib/models";
import { Brief, BriefSqlFilter, fetchItems } from "@/lib/models";
import nextConnect from "next-connect";

export default nextConnect()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) return;
    let response;
    await db.transaction(async (tx) => {
      try {
        const brief = await models.fetchBrief(id)(tx);
        await Promise.all([
          (brief.skills = await fetchItems(brief.skill_ids, "skills")(tx)),
          (brief.industries = await fetchItems(
            brief.industry_ids,
            "industries"
          )(tx)),
        ]);
        response = brief;
      } catch (e) {
        response = new Error(`Failed to fetch brief with id ${id}`, {
          cause: e as Error,
        });
      }
    });
    res.status(200).json(response);
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const data = req.body as BriefSqlFilter;
    await db.transaction(async (tx: any) => {
      try {
        const briefs: Array<Brief> = await models.searchBriefs(tx, data);

        const { currentData, totalItems } = await models.paginatedData(
          Number(data?.page || 1),
          Number(data?.items_per_page || 5),
          briefs
        );

        await Promise.all([
          currentData,
          ...currentData.map(async (brief: any) => {
            brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
            brief.industries = await fetchItems(
              brief.industry_ids,
              "industries"
            )(tx);
          }),
        ]);

        res.status(200).json({ currentData, totalBriefs: totalItems });
      } catch (e) {
        new Error(`Failed to search for briefs ${data}`, { cause: e as Error });
      }
    });
  });
