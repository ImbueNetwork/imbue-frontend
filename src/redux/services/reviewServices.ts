import { Review } from '@/lib/queryServices/reviewQueries';

import { apiBase, postAPIHeaders } from '@/config';

export const postReviewService = async (review: Review) => {
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
