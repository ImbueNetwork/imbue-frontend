import { dummyFreelanderProfile } from '@/config/briefs-data';

import { dummyFreelancerBrief } from './briefsData';
import { dummyUser } from './userData';

export const getCurrentUser = jest.fn().mockResolvedValue(dummyUser);

export const getFreelancerProfile = jest
  .fn()
  .mockResolvedValue(dummyFreelanderProfile);
export const getFreelancerBrief = jest.fn().mockResolvedValue(undefined);
export const getBrief = jest.fn().mockResolvedValue(dummyFreelancerBrief);
