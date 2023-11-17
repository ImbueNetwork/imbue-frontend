import { Knex } from 'knex';

export interface RreviewType {
  user_id: number;
  freelancer_id: number;
  title: string;
  description: string;
  ratings: number;
}

export const getReviewByFreelancer =
  (freelancer_id: number) => async (tx: Knex.Transaction) =>
    tx('reviews')
      .select(
        'reviews.id',
        'ratings',
        'title',
        'description',
        'created',
        'modified',
        'users.display_name',
        'users.profile_photo',
        'users.country',
        'users.region',
        'users.username'
      )
      .where({ freelancer_id })
      .leftJoin('users', 'user_id', 'users.id');

export const getReviewByUser =
  (review: RreviewType) => async (tx: Knex.Transaction) =>
    tx('reviews').insert(review);

export const postReview =
  (review: RreviewType) => async (tx: Knex.Transaction) =>
    tx('reviews').insert(review).returning('id').first()
