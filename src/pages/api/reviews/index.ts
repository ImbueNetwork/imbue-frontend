import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  getReviewByFreelancer as getReviewsOfUser,
  postReview,
} from '@/lib/queryServices/reviewQueries';

import db from '@/db';
import { User } from '@/model';

import { authenticate, verifyUserIdFromJwt } from '../auth/common';

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { user_id } = req.query;

        if (!user_id)
          return res.status(404).json({ message: `Freelancer id not found` });

        const resp = await getReviewsOfUser(Number(user_id))(tx);

        res.status(200).json(resp);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(404).json({ message: `Internal Error: ${error}` });
      }
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { user_id, title, description, ratings } = req.body;

        const userAuth: Partial<User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        verifyUserIdFromJwt(req, res, [userAuth.id]);

        const reviewer_id = userAuth.id;

        if (!user_id || !user_id || !ratings)
          return res.status(500).send({
            status: 'error',
            message: `Fields missing. Please make sure to add freelancer_id, user_id, ratings`,
          });

        const review = {
          user_id,
          reviewer_id,
          title,
          description,
          ratings,
        };

        const resp = await postReview(review)(tx);
        console.log('🚀 ~ file: index.ts:67 ~ db.transaction ~ resp:', resp);

        if (!resp)
          return res
            .status(500)
            .send({ status: 'error', message: 'could not insert review' });

        res.status(200).json({ status: 'success', resp });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(401).json(new Error('Server error: ' + error));
      }
    });
  });
