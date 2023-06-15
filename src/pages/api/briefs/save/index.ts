import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/db";
import nextConnect from "next-connect";
import * as models from "../../models";
import { Brief } from "@/model";

export default nextConnect()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const brief: Brief | any = req.body as Brief;
    let response: any;
    await db.transaction(async (tx: any) => {
      try {
        const saved_brief_id = await models.insertSavedBrief(
          brief,
          brief.scope_id,
          brief.duration_id,
          brief?.currentUserId
        )(tx);
        if (saved_brief_id?.status) {
          response = saved_brief_id;
          return new Error("Failed to save brief.");
        } else {
          response = saved_brief_id;
        }
      } catch (e) {
        response = {
          status: "Failed to save brief.",
        };
        new Error(
          `Failed to save brief for brief with name: ${brief.headline}`,
          { cause: e as Error }
        );
        console.log(e);
      }
    });
    if (response?.status) {
      res.status(200).json({
        status: "Failed",
        message: "Brief already exists.",
      });
      return;
    } else {
      res.status(200).json({
        status: "Successful",
        brief_id: response,
      });
    }
  })
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const data: any = req.query;

    await db.transaction(async (tx: any) => {
      try {
        await models
          .getSavedBriefs(data?.user_id)(tx)
          .then(async (briefs: any) => {
            const { currentData, totalItems } = await models.paginatedData(
              Number(data?.page || 1),
              Number(data?.items_per_page || 5),
              briefs
            );

            await Promise.all([
              currentData,
              ...currentData.map(async (brief: any) => {
                brief.skills = await models.fetchItems(
                  brief.skill_ids,
                  "skills"
                )(tx);
                brief.industries = await models.fetchItems(
                  brief.industry_ids,
                  "industries"
                )(tx);
              }),
            ]);

            res.status(200).json({ currentData, totalBriefs: totalItems });
          });
      } catch (e) {
        new Error(`Failed to fetch saved briefs`, { cause: e as Error });
      }
    });
  });
