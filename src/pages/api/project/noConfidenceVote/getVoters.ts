import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
    getNoConfidenceVotersAddress,
} from '@/lib/queryServices/projectQueries';

import db from '@/db';


export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId } = req.query;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        // const userAuth: Partial<models.User> | any = await authenticate(
        //   'jwt',
        //   req,
        //   res
        // );
        // const projectApproverIds = await models.fetchProjectApproverUserIds(
        //   Number(projectId)
        // )(tx);
        // verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        const result = await getNoConfidenceVotersAddress(
          Number(projectId)
        )(tx);
        return res.status(201).json(result);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
