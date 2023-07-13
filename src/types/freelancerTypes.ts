/* eslint-disable no-unused-vars */
import { Freelancer, User } from '@/model';

export type FreelancerProps = {
  user: User;
};

export type FreelancerState = {
  step: number;
  info: Freelancer;
  display_name: string;
};

export type FilterOption = {
  interiorIndex: number;
  value: string;
};

export enum FreelancerFilterOption {
  Skills = 0,
  Services = 1,
  Languages = 2,
  FreelancerInfo = 3,
}
