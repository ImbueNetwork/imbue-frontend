/* eslint-disable no-console */
import Filter from 'bad-words';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  fetchAllBriefs,
  fetchItems,
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
    const data = req.query;
    await db.transaction(async (tx: any) => {
      try {
        await fetchAllBriefs()(tx).then(async (briefs: any) => {
          const filteredOutProjects = briefs.filter(
            (brief: any) => !brief.project_id
          );

          const { currentData } = models.paginatedData(
            Number(data?.page || 1),
            Number(data?.items_per_page || 5),
            filteredOutProjects
          );

          await Promise.all([
            currentData,
            ...currentData.map(async (brief: any) => {
              brief.skills = await fetchItems(brief.skill_ids, 'skills')(tx);
              brief.industries = await fetchItems(
                brief.industry_ids,
                'industries'
              )(tx);
            }),
          ]);

          res.status(200).json({
            currentData: currentData,
            totalBriefs: filteredOutProjects?.length,
          });
        });
      } catch (e) {
        new Error(`Failed to fetch all briefs`, { cause: e as Error });
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
          return new Error('Failed to create brief.');
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
          industry_ids
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
