import { ReviewBody } from './lib/queryServices/reviewQueries';

export enum Currency {
  IMBU = 0,
  KSM = 1,
  // AUSD = 2,
  // KAR = 3,
  MGX = 4,
  // Anything over 100 should be multichain
  ETH = 100,
  USDT = 101,
}

// ONCHAIN PROJECT STATE
export enum OffchainProjectState {
  Draft = 0,
  PendingReview = 1,
  ChangesRequested = 2,
  Rejected = 3,
  Accepted = 4,
  Refunded = 5,
  Completed = 6,
}

export type EVMContract = {
  address: string;
  decimals: number;
};

export const applicationStatusId = [
  'Draft',
  'Pending Review',
  'Changes Requested',
  'Rejected',
  'Accepted',
  'Refunded',
  'Completed',
];

export function displayState(state: OffchainProjectState) {
  switch (state) {
    case OffchainProjectState.PendingReview:
      return 'Pending Review';
    case OffchainProjectState.ChangesRequested:
      return 'Changes Requested';
    default:
      return OffchainProjectState[state];
  }
}

// ONCHAIN PROJECT STATE
export enum OnchainProjectState {
  PendingProjectApproval = 0,
  PendingFundingApproval = 1,
  OpenForContribution = 2,
  PendingMilestoneSubmission = 3,
  PendingMilestoneApproval = 4,
  OpenForVoting = 5,
  OpenForWithdraw = 6,
  OpenForVotingOfNoConfidence = 7,
}

export enum RoundType {
  VotingRound,
  VoteOfNoConfidence,
  ContributionRound,
}

export enum ButtonState {
  Default,
  Saving,
  Done,
}

export enum ProjectType {
  Brief = 0,
  Grant = 1,
}

export enum ImbueChainPollResult {
  Pending,
  EventFound,
  EventNotFound,
}

export type VotesResp = {
  yes: User[];
  no: User[];
  pending: User[];
};

export type Project = {
  id?: string | number;
  name: string;
  logo: string;
  description: string;
  website: string;
  category?: string | number;
  chain_project_id?: number;
  required_funds: number;
  currency_id: number;
  owner?: string;
  user_id?: string | number;
  brief_id?: string | number;
  total_cost_without_fee?: number;
  imbue_fee?: number;
  status_id?: number;
  // project_type: ProjectType;
  approvers: string[];
  created?: string;
  duration_id: number;
  escrow_address: string;
  completed: boolean;
  milestones: Milestone[];
  project_in_voting_of_no_confidence?: boolean;
  project_in_milestone_voting?: boolean;
  first_pending_milestone?: number;
  payment_address: string;
  reviews?: ReviewBody[];
};

export type ProjectOnChain = {
  id: string | number;
  requiredFunds: bigint;
  requiredFundsFormatted: number;
  raisedFunds: bigint;
  raisedFundsFormatted: number;
  withdrawnFunds: bigint;
  currencyId: Currency;
  milestones: Milestone[];
  contributions: Contribution[];
  initiator: string;
  createBlockNumber: bigint;
  approvedForFunding: boolean;
  fundingThresholdMet: boolean;
  roundKey?: number | undefined;
  cancelled: boolean;
  projectState: OnchainProjectState;
  fundingType: any;
  projectInMilestoneVoting: boolean;
  projectInVotingOfNoConfidence: boolean;
  projectVotes?: any;
  milestoneVotes?: any;
  disputeVotes?: any;
};

export type Milestone = {
  approvedForFunding?: boolean;
  project_id: number;
  chain_project_id: number;
  milestone_index: number;
  name: string;
  modified?: Date;
  percentage_to_unlock: number;
  is_approved: boolean;
  amount: number;
  description: string;
  withdrawn_onchain: boolean;
  withdrawn_offchain: boolean;
  withdrawal_transaction_hash: string;
  imbue_fee_transaction_hash: string;
  attachments: any;
};

export type Contribution = {
  accountId: string;
  value: bigint;
  timestamp: bigint;
};

export type Web3Account = {
  address: string;
  user_id: number;
  type: string;
  challenge: string;
};

export type User = {
  email: any;
  id: number;
  display_name: string;
  web3Accounts?: Web3Account[];
  username: string;
  password?: string;
  getstream_token: string;
  web3_address?: string;
  profile_photo?: string;
  country?: string;
  region?: string;
  about?: string;
  website?: string;
  industry?: string;
  created?: string;
};

export type Vote = {
  voterAddress: string;
  vote: boolean;
};

export interface BasicTxResponse {
  errorMessage: string | null;
  callHash?: string;
  status?: boolean;
  transactionHash?: string;
  txError?: boolean;
  eventData?: any;
  projectInMilestoneVoting?: boolean;
}

export type Freelancer = {
  id: string | number;
  about: string;
  education: string;
  experience: string;
  facebook_link: string;
  twitter_link: string;
  telegram_link: string;
  discord_link: string;
  freelanced_before: string;
  freelancing_goal: string;
  work_type: string;
  title: string;
  skills: Item[];
  languages: Item[];
  services: Item[];
  clients: Item[];
  client_images: string[];
  display_name: string;
  username: string;
  user_id: number;
  rating?: number;
  num_ratings: number;
  profile_image: string;
  verified: boolean;
};

export type FreelancerResponse = {
  currentData: Array<Freelancer>;
  totalFreelancers: number;
  message?: string;
};

export function getDefaultFreelancer(): Freelancer {
  return {
    id: 0,
    about: '',
    education: '',
    experience: '',
    facebook_link: '',
    twitter_link: '',
    telegram_link: '',
    discord_link: '',
    freelanced_before: '',
    freelancing_goal: '',
    work_type: '',
    title: '',
    skills: [],
    languages: [],
    services: [],
    clients: [],
    client_images: [],
    display_name: 'default_name',
    username: 'default',
    user_id: 0,
    rating: 3,
    num_ratings: 0,
    profile_image: '',
    verified: false,
  };
}

export type Item = {
  id: number;
  name: string;
};

// The same as backend/briefs
export type Brief = {
  id: number | string;
  headline: string;
  industries: Item[];
  description: string;
  skills: Item[];
  scope_id: number;
  scope_level: string;
  duration: string;
  duration_id: number;
  budget: bigint | any;
  created: Date;
  created_by: string;
  experience_level: string;
  experience_id: number;
  number_of_briefs_submitted: number;
  number_of_applications?: number;
  user_id: number;
  project_id?: number;
  currentUserId?: number;
  verified_only: boolean;
  owner_name: string;
  owner_photo: string;
};

export type BriefSqlFilter = {
  experience_range: Array<number>;
  submitted_range: Array<number>;
  submitted_is_max: boolean;
  length_range: Array<number>;
  length_is_max: boolean;
  search_input: string | string[];
  items_per_page?: number;
  page: number;
  skills_range: Array<number>;
  verified_only: boolean;
  non_verified: boolean;
};

export type FreelancerSqlFilter = {
  skills_range: Array<number>;
  services_range: Array<number>;
  languages_range: Array<number>;
  name: string | string[];
  items_per_page?: number;
  page: number;
  verified?: boolean;
};
export type ApplicationData = {
  brief_id: number;
  category: string;
  chain_project_id: number;
  create_block_number: number;
  created: Date;
  currency_id: number;
  description: string;
  freelancer: Freelancer;
  id: string;
  imbue_fee: string;
  logo: string;
  milestones: Milestone[];
  modified: Date;
  name: string;
  owner: string;
  required_funds: string;
  status_id: number;
  total_cost_without_fee: string;
  user_id: number;
  website: string;
};
export type ApplicationContainerProps = {
  application: ApplicationData;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  // redirectToApplication: (_applicationId: string) => void;
};
