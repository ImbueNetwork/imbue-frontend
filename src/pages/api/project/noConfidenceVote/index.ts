import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  insertToNoConfidenceVoters,
  NoConfidenceVoter,
} from '@/lib/queryServices/projectQueries';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId } = req.query;
        const userData = req.body;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        const voter: NoConfidenceVoter = {
          project_id: Number(projectId),
          user_id: userData.id,
          username: userData.username,
          web3_address: userData.web3_address,
          display_name: userData.display_name,
          profile_photo: userData.profile_photo,
        };

        const userAuth: Partial<models.User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        const projectApproverIds = await models.fetchProjectApproverUserIds(
          Number(projectId)
        )(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        const result = await insertToNoConfidenceVoters(
          Number(projectId),
          voter
        )(tx);
        return res.status(201).json(result);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
