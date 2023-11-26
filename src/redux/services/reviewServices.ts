import { ReviewBody } from '@/lib/queryServices/reviewQueries';

import { apiBase, getAPIHeaders, postAPIHeaders } from '@/config';

export const postReviewService = async (review: ReviewBody) => {
  try {
    const resp = await fetch(`${apiBase}reviews`, {
      method: 'Post',
      headers: postAPIHeaders,
      body: JSON.stringify(review),
    });

    return await resp.json();
  } catch (error) {
    return { status: 'Error', message: error };
  }
};

export const getReviewService = async (
  user_id?: string | number,
  reviewer_id?: number | string
) => {
  try {
    const resp = await fetch(
      `${apiBase}reviews?user_id=${user_id || ''}&reviewer_id=${
        reviewer_id || ''
      }`,
      {
        method: 'GET',
        headers: getAPIHeaders,
      }
    );

    return await resp.json();
  } catch (error) {
    return { status: 'Error', message: error };
  }
};
