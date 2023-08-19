/* eslint-disable no-unused-vars */
import { Brief, Item } from '@/model';

export type FilterOption = {
  interiorIndex: number;
  search_for: number[];
  or_max: boolean;
  value: string;
};

export enum BriefFilterOption {
  ExpLevel = 0,
  AmountSubmitted = 1,
  Length = 2,
  // HoursPerWeek = 3,
  Skills = 3,
}

export type BriefState = {
  step: number;
  info: BriefInfo;
};

export type BriefInfo = {
  headline: string;
  industries: string[] | Item[];
  description: string;
  scope_id: number | undefined;
  experience_id: number | undefined;
  duration_id: number | undefined;
  skills: string[] | Item[];
  budget: bigint | undefined;
  user_id?: number | undefined;
  brief_id?: number | undefined;
  verified_only: boolean;
};

export type BriefStepProps = {
  currentBriefs: Brief[];
  paginate: (_page: number) => void;
};

export type PaginatedResponse = {
  statuud: number;
  currentData: unknown[];
  totalBriefs: number;
};
