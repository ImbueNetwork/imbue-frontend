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
  HoursPerWeek = 3,
}

export type BriefProps = {};

export type BriefState = {
  step: number;
  info: BriefInfo;
};

export type BriefInfo = {
  headline: string;
  industries: string[];
  description: string;
  scope_id: number | undefined;
  experience_id: number | undefined;
  duration_id: number | undefined;
  skills: string[];
  budget: bigint | undefined;
  user_id: number | undefined;
};
