import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import {
  getAllReviewsByUser,
  getAllReviewsOfUser,
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
        const { user_id, reviewer_id } = req.query;

        if (!user_id && !reviewer_id)
          return res.status(404).json({ message: `user id not found` });

        let resp;

        if (user_id) resp = await getAllReviewsOfUser(Number(user_id))(tx);
        else resp = await getAllReviewsByUser(Number(reviewer_id))(tx);

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
        const { user_id, title, description, ratings, project_id } = req.body;

        const userAuth: Partial<User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        verifyUserIdFromJwt(req, res, [userAuth.id]);

        const reviewer_id = userAuth.id;

        if (user_id == reviewer_id)
          return res.status(500).send({
            status: 'error',
            message: `You cannot review your own profile`,
          });

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
          project_id,
        };

        const resp = await postReview(review)(tx);

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
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      const userAuth: Partial<User> | any = await authenticate('jwt', req, res);
      verifyUserIdFromJwt(req, res, [userAuth.id]);

      try {
        const {
          id,
          user_id,
          project_id,
          ratings,
          title,
          description,
          reviewer_id,
        } = req.body;

        if (!user_id || !reviewer_id)
          return res.status(404).json({
            status: 'Error',
            message: 'No user_id or reviewer_id were specified',
          });

        const existingReview = await tx('reviews')
          .select('*')
          .where({ id })
          .first();

        if (existingReview.reviewer_id !== userAuth.id)
          return res.status(500).json({
            status: 'Error',
            message: 'You are not allowed to update this review',
          });

        const review = {
          user_id,
          project_id,
          ratings,
          title,
          description,
          reviewer_id,
        };

        const resp = await tx('reviews').update(review).where({ id });
        if (resp) res.status(200).json({ status: 'success' });
        else
          res
            .status(404)
            .json({ status: 'Failed', message: 'Failed to update data' });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(404).json({
          status: 'Error',
          message: error,
        });
      }
    });
  })
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async (tx) => {
      try {
        const { id } = req.query;

        if (!id)
          return res.status(404).json({
            status: 'Error',
            message: 'No id specified to delete',
          });

        const userAuth: Partial<User> | any = await authenticate(
          'jwt',
          req,
          res
        );
        verifyUserIdFromJwt(req, res, [userAuth.id]);

        const existingReview = await tx('reviews')
          .select('*')
          .where({ id })
          .first();

        if (existingReview.reviewer_id !== userAuth.id)
          return res.status(500).json({
            status: 'Error',
            message: 'You are not allowed to update this review',
          });

        const resp = await tx('reviews').delete().where({ id });

        if (resp) res.status(200).json({ status: 'success' });
        else
          res
            .status(404)
            .json({ status: 'Failed', message: 'Failed to update data' });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(404).json({
          status: 'Error',
          message: error,
        });
      }
    });
  });
