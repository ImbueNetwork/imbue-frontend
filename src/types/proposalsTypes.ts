import { Freelancer } from "@/model";

export type DraftMilestone = {
  name: string;
  percentage_to_unlock: number;
};

export type Milestone = DraftMilestone & {
  milestone_index?: number;
  project_id: number;
  is_approved: boolean;
  created: string;
  modified: string;
};

export type DraftProposal = {
  name: string;
  logo: string;
  description: string;
  website: string;
  milestones: DraftMilestone[];
  required_funds: number;
  currency_id: number;
  owner: string;
  user_id?: number;
  chain_project_id?: number;
  category?: string | number;
};

export type Proposal = DraftProposal & {
  id: number;
  status: string;
  user_id: number;
  create_block_number?: number;
  created: string;
  modified: string;
  milestones: Milestone[];
};

export type ProposalItemProps = {
  projectId: number;
  imageSrc: string;
  name: string;
};

export type DropdownSelectData = {
  value: any;
  label: string;
  body?: string;
};
export enum NumberOfItemsPerList {
  ONE = 1,
  TWO = 2,
}

export type FreelancerStepProps = {
  currentFreelancers: Freelancer[];
  paginate: (page: number) => void;
};
