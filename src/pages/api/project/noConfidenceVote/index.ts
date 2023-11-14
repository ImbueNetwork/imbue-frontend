import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import {
  insertToNoConfidenceVoters,
  NoConfidenceVote,
} from '@/lib/queryServices/projectQueries';

import db from '@/db';

import { authenticate, verifyUserIdFromJwt } from '../../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { projectId } = req.query;
        const { voter, vote } = req.body;

        if (!projectId) {
          return res
            .status(401)
            .json({ message: 'No project found for update' });
        }

        const voteData: NoConfidenceVote = {
          project_id: Number(projectId),
          user_id: voter.id,
          web3_address: voter.web3_address,
          vote,
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
          voteData
        )(tx);
        return res.status(201).json(result);
      } catch (cause) {
        return res.status(401).json(cause);
      }
    });
  });
