/* eslint-disable no-console */
import Filter from 'bad-words';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchAllBriefs,
  fetchItems,
  fetchProjectById,
  fetchUserBriefs,
  incrementUserBriefSubmissions,
  insertBrief,
  upsertItems,
} from '@/lib/models';
import * as models from '@/lib/models';

import db from '@/db';
import { Brief } from '@/model';

import { authenticate, verifyUserIdFromJwt } from '../auth/common';

const filter = new Filter();

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { page, items_per_page } = req.query;
    await db.transaction(async (tx: any) => {
      try {
        // await fetchAllBriefs()(tx).then(async (briefs: any) => {
        //   const filteredOutProjects = briefs.filter(
        //     (brief: any) => !brief.project_id
        //   );

        //   // const { currentData } = models.paginatedData(
        //   //   Number(page || 1),
        //   //   Number(items_per_page || 5),
        //   //   filteredOutProjects
        //   // );

        // });

        const currentData = await fetchAllBriefs()(tx)
          .offset((Number(page || 1) - 1) * Number(items_per_page || 6))
          .limit(Number(items_per_page || 5))
          .distinct('briefs.id')
          .whereNull('briefs.project_id');

        await Promise.all([
          currentData,
          ...currentData.map(async (brief: any) => {
            const userProject = await fetchUserBriefs(brief.user_id)(tx);
            const user_hire_history = await Promise.all(
              userProject.map(async (brief: any) => {
                if (brief.project_id) {
                  const re = await fetchProjectById(brief.project_id)(tx);
                  return {
                    project_status: re?.status_id,
                    cost: re?.total_cost_without_fee,
                  };
                }
                return { project_status: 0 };
              })
            );
            brief.user_hire_history = user_hire_history;
            brief.skills = await fetchItems(brief.skill_ids, 'skills')(tx);
            brief.industries = await fetchItems(
              brief.industry_ids,
              'industries'
            )(tx);
          }),
        ]);

        const briefsCount = await models.countAllBriefs()(tx);

        res.status(200).json({
          currentData: currentData,
          totalBriefs: briefsCount?.count || 0,
        });
      } catch (e) {
        res.status(401).json({
          currentData: [],
          totalBriefs: 0,
        });
        throw new Error(`Failed to fetch all briefs`, { cause: e as Error });
      }
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const brief: Brief = req.body as Brief;
    let response;

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );
    verifyUserIdFromJwt(req, res, [userAuth.id]);

    await db.transaction(async (tx: any) => {
      try {
        if (filter.isProfane(brief.headline)) {
          res.status(401).json({
            status: 'Failed',
            message: 'Bad word is not allowed',
          });
          throw new Error('Bad word is not allowed');
        }

        const skill_ids = await upsertItems(brief.skills, 'skills')(tx);
        const industry_ids = await upsertItems(
          brief.industries,
          'industries'
        )(tx);

        const brief_id = await insertBrief(
          brief,
          skill_ids,
          industry_ids,
          brief.scope_id,
          brief.duration_id
        )(tx);
        if (!brief_id) {
          res.status(401).json({
            status: 'Failed',
            message: 'Failed to create brief.',
          });
          return new Error('Failed to create brief.');
        }
        await incrementUserBriefSubmissions(brief.user_id)(tx);

        response = brief_id;
      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to create brief for brief with name: ${brief.headline}. Cause ${e}`,
        });
        throw new Error(
          `Failed to create brief for brief with name: ${brief.headline}`,
          { cause: e as Error }
        );
      }
    });
    res.status(200).json({
      status: 'Successful',
      brief_id: response,
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const brief: Brief = req.body as Brief;
    let response;

    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    verifyUserIdFromJwt(req, res, [userAuth.id]);

    if (!brief?.user_id || userAuth.id !== brief.user_id)
      return res.status(401).json({
        message: 'Only owner can update brief',
      });

    await db.transaction(async (tx: any) => {
      try {
        const skill_ids = await upsertItems(brief.skills, 'skills')(tx);
        const industry_ids = await upsertItems(
          brief.industries,
          'industries'
        )(tx);

        const brief_id = await models.updateBrief(
          filter.clean(brief.headline),
          filter.clean(brief.description),
          brief.scope_id,
          brief.experience_id,
          brief.duration_id,
          brief.budget,
          brief.id,
          skill_ids,
          industry_ids,
          brief.verified_only
        )(tx);

        if (!brief_id) {
          return new Error('Failed to update brief.');
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
    res.status(200).json({
      status: 'Successful',
      brief_id: response,
    });
  });
