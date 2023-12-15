import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import { Brief, BriefSqlFilter, fetchItems } from '@/lib/models';
import { deleteAllBriefApplications, deleteBriefIndustries, deleteBriefSkills } from '@/lib/queryServices/briefQueries';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) return;
    let response;
    await db.transaction(async (tx) => {
      try {
        const brief = await models.fetchBrief(id)(tx);
        await Promise.all([
          (brief.skills = await fetchItems(brief.skill_ids, 'skills')(tx)),
          (brief.industries = await fetchItems(
            brief.industry_ids,
            'industries'
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
    // const userAuth: Partial<models.User> | any = await authenticate(
    //   'jwt',
    //   req,
    //   res
    // );
    // verifyUserIdFromJwt(req, res, [userAuth.id]);

    await db.transaction(async (tx: any) => {
      try {
        await models
          .searchBriefs({ ...data, items_per_page: 0 })(tx)
          .then(async (allBriefs) => {
            const currentData: Array<Brief> = allBriefs.slice(
              data.items_per_page * (data.page - 1),
              data.items_per_page * data.page
            );

            await Promise.all([
              ...currentData.map(async (brief: any) => {
                brief.skills = await fetchItems(brief.skill_ids, 'skills')(tx);
                brief.industries = await fetchItems(
                  brief.industry_ids,
                  'industries'
                )(tx);
              }),
            ]);

            return res
              .status(200)
              .json({ currentData, totalBriefs: allBriefs.length });
          });

        // await Promise.all([
        //   currentData,
        //   ...currentData.map(async (brief: any) => {
        //     brief.skills = await fetchItems(brief.skill_ids, 'skills')(tx);
        //     brief.industries = await fetchItems(
        //       brief.industry_ids,
        //       'industries'
        //     )(tx);
        //   }),
        // ]);

        // const totalBriefs = await models
        //   .searchBriefs({
        //     ...data,
        //     items_per_page: 0,
        //   })(tx)
        //   .then((resp) => resp.length);

        // const briefCount = await models.searchBriefsCount({
        //   ...data,
        //   items_per_page: 0,
        // })(tx);

        // const { currentData, totalItems } = await models.paginatedData(
        //   Number(data?.page || 1),
        //   Number(data?.items_per_page || 5),
        //   briefs
        // );

        // res.status(200).json({ currentData, totalBriefs: briefCount });
      } catch (e) {
        res.status(401).json({ currentData: [], totalBriefs: 0 });
        throw new Error(`Failed to search for briefs`, { cause: e as Error });
      }
    });
  })
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id)
      return res
        .status(404)
        .send({ status: 'Failed', message: 'No brief found to delete.' });

    await db.transaction(async (tx: any) => {
      const userAuth: Partial<models.User> | any = await authenticate(
        'jwt',
        req,
        res
      );
      verifyUserIdFromJwt(req, res, [userAuth.id]);

      const brief = await models.fetchBrief(id)(tx);
      await deleteBriefSkills(brief.id)(tx);
      await deleteBriefIndustries(brief.id)(tx);
      await deleteAllBriefApplications(brief.id)(tx);

      if (brief.user_id !== userAuth.id)
        return res
          .status(500)
          .send({ status: 'Failed', message: 'Unauthorized action' });

      await tx('briefs').where({ id: id }).del();

      res.status(200).send({
        status: 'Success',
        message: `brief: ${id} deleted successfully`,
      });
    });
  });
