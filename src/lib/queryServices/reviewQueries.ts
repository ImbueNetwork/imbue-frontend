import { Knex } from 'knex';

export interface ReviewBody {
  user_id: number;
  reviewer_id: number;
  title: string;
  description: string;
  ratings: number;
  project_id?: string | number;
}

export interface ReviewType {
  id: number;
  reviewer_id: number;
  created: string;
  modified: string;
  display_name: string;
  profile_photo: string;
  username: string;
  region: string;
  country: string;
  title: string;
  description: string;
  ratings: number;
  project_id?: string | number;
}

export const getAllReviewsOfUser =
  (user_id: number) => async (tx: Knex.Transaction) =>
    tx('reviews')
      .select(
        'reviews.id',
        'ratings',
        'title',
        'description',
        'created_at as created',
        'updated_at as modified',
        'reviewer_id',
        'project_id',
        'users.display_name',
        'users.profile_photo',
        'users.country',
        'users.region',
        'users.username'
      )
      .where({ user_id })
      .leftJoin('users', 'reviewer_id', 'users.id');

export const getAllReviewsByUser =
  (reviewer_id: number) => async (tx: Knex.Transaction) =>
    tx('reviews')
      .select(
        'reviews.id',
        'ratings',
        'title',
        'description',
        'created_at as created',
        'updated_at as modified',
        'reviewer_id',
        'project_id',
        'users.display_name',
        'users.profile_photo',
        'users.country',
        'users.region',
        'users.username'
      )
      .where({ reviewer_id })
      .leftJoin('users', 'user_id', 'users.id');

export const postReview =
  (review: ReviewBody) => async (tx: Knex.Transaction) =>
    tx('reviews').insert(review).returning('id');
