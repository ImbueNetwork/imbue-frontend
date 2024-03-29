/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { Knex } from 'knex';
import { StreamChat } from 'stream-chat';

import db from '@/db';

export type FederatedCredential = {
  id: number;
  issuer: string;
  subject: string;
};

export type Skill = {
  id: number;
  name: string;
};

export type Industry = {
  id: number;
  name: string;
};

export type Language = {
  id: number;
  name: string;
};

export type Service = {
  id: number;
  name: string;
};

export enum ProjectStatus {
  Draft = 0,
  PendingReview = 1,
  ChangesRequested = 2,
  Rejected = 3,
  Accepted = 4,
}

export type Web3Account = {
  address: string;
  user_id: number;
  type: string;
  challenge: string;
};

export type User = {
  id: number;
  display_name: string;
  web3Accounts: Web3Account[];
  username: string;
  email: string;
  password: string;
  briefs_submitted: number;
  getstream_token: string;
  profile_photo?: string;
  country?: string;
  region?: string;
  web3_address?: string;
  about?: string;
  website?: string;
  industry?: string;
  last_notification_id?: string;
};

export type ProposedMilestone = {
  name: string;
  percentage_to_unlock: number;
  amount: number;
  description: string;
  chain_project_id?: string;
  attachments: any;
};

export type GrantApprover = string;

export type Grant = {
  id?: string | number;
  title: string;
  description: string;
  milestones: ProposedMilestone[];
  duration_id: number;
  required_funds: number;
  total_cost_without_fee: number;
  imbue_fee: number;
  user_id: number;
  owner: string;
  currency_id: number;
  onchain_address: string;
  approvers: GrantApprover[];
  chain_project_id: number;
  escrow_address: string;
  payment_address: string;
};

export type Milestone = ProposedMilestone & {
  milestone_index: number;
  project_id: number | string;
  is_approved: boolean;
  withdrawn_onchain: boolean;
  withdrawn_offchain: boolean;
  withdrawal_transaction_hash: string;
  imbue_fee_transaction_hash: string;
  attachments: any;
};

export type MilestoneDetails = {
  index: number | string;
  project_id: number | string;
  details: string;
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
  // project_type: number;
  escrow_address?: string;
  duration_id: number;
  completed?: boolean;
  first_pending_milestone?: number;
  project_in_voting_of_no_confidence?: boolean;
  payment_address: string;
};

export type ProjectProperties = {
  id?: string | number;
  faq: string;
  project_id?: string | number;
};

// created_by: string;
// hours_per_week: number,
// briefs_submitted_by: number,
export type Brief = {
  id?: string | number;
  headline: string;
  industry_ids: number[];
  industries: string[];
  description: string;
  skill_ids: number[];
  skills: string[];
  scope_id: number;
  scope_level: string;
  duration_id: number;
  duration: string;
  budget: bigint;
  experience_level: string;
  experience_id: number;
  user_id: number;
  project_id: number;
  verified_only: boolean;
};

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
  skills: string[];
  languages: string[];
  services: string[];
  clients: string[];
  client_images: string[];
  display_name: string;
  username: string;
  user_id: number;
  rating?: number;
  num_ratings: number;
  country?: string;
  region?: string;
  profile_image?: string;
  hour_per_rate: number;
};

export type BriefSqlFilter = {
  non_verified: boolean;
  experience_range: number[];
  submitted_range: number[];
  submitted_is_max: boolean;
  length_range: number[];
  length_is_max: boolean;
  search_input: string;
  items_per_page: number;
  page: number;
  skills_range: Array<number>;
  verified_only: boolean;
};

export type FreelancerSqlFilter = {
  skills_range: Array<number>;
  services_range: Array<number>;
  languages_range: Array<number>;
  name: string;
  items_per_page: number;
  page: number;
  verified: boolean;
};

export type PagerProps = {
  currentData: unknown[];
  totalItems: number;
};

export const resetUserWeb3Addresses =
  (address: string) => (tx: Knex.Transaction) =>
    tx.raw(
      `UPDATE USERS SET web3_address=NULL WHERE web3_address='${address}'`
    );

export const fetchWeb3AccountByAddress =
  (address: string) => (tx: Knex.Transaction) =>
    fetchAllWeb3Account()(tx)
      .where({ address })
      .leftJoin('users', { 'users.id': 'web3_accounts.user_id' })
      .first();

export const fetchAllWeb3Account = () => (tx: Knex.Transaction) =>
  tx<Web3Account>('web3_accounts').select();

export const fetchWeb3AccountByUserId =
  (user_id: number) => (tx: Knex.Transaction) =>
    fetchAllWeb3Account()(tx).where({ user_id }).first();

export const fetchWeb3AccountsByUserId =
  (user_id: number) => (tx: Knex.Transaction) =>
    fetchAllWeb3Account()(tx).where({ user_id }).select();

export const fetchAllUser = () => (tx: Knex.Transaction) =>
  tx<User>('users')
    .select('id', 'display_name', 'profile_photo', 'username', 'web3_address')
    .orderBy('web3_address');

export const fetchUserWithUsernameOrAddress =
  (usernameOrAddress: string) => (tx: Knex.Transaction) =>
    tx<User>('users')
      .where((builder) =>
        builder
          .whereRaw('LOWER(username) = ?', usernameOrAddress.toLowerCase())
          .orWhereRaw(
            'LOWER(web3_address) = ?',
            usernameOrAddress.toLowerCase()
          )
      )
      .select('id', 'display_name', 'profile_photo', 'username', 'web3_address')
      .first();

export const searchUserWithNameOrAddress =
  (usernameOrAddress: string) => (tx: Knex.Transaction) =>
    tx<User>('users')
      .where('display_name', 'ilike', `%${usernameOrAddress}%`)
      .orWhere('web3_address', 'ilike', `%${usernameOrAddress}%`)
      .select('id', 'display_name', 'profile_photo', 'username', 'web3_address')
      .orderBy('web3_address', 'asc');

export const fetchUser = (id: number) => (tx: Knex.Transaction) => {
  return tx<User>('users').where({ id }).first();
};

export const updateUserData =
  (id: number, data: Partial<User>) => async (tx: Knex.Transaction) =>
    (await tx<User>('users').update(data).where({ id }).returning('*'))[0];

export const updateFederatedCredentials =
  (id: number, username: string) => async (tx: Knex.Transaction) =>
    await tx<FederatedCredential>('federated_credentials')
      .update({ subject: username })
      .where({
        id: id,
      });

export const fetchUserOrEmail =
  (userOrEmail: string) => async (tx: Knex.Transaction) => {
    // get all db users
    const user = await tx<User>('users')
      .select()
      .first()
      .where({ username: userOrEmail })
      .orWhere({ email: userOrEmail });
    // check if userOrEmail is in db
    // const user = users.find(
    //   (u) =>
    //     u.username === userOrEmail.toLowerCase() ||
    //     u.email === userOrEmail.toLowerCase()
    // );
    if (user) {
      return user;
    } else {
      return null;
    }
  };

export const upsertWeb3Challenge =
  (user: User, address: string, type: string, challenge: string) =>
  async (
    tx: Knex.Transaction
  ): Promise<[web3Account: Web3Account, isInsert: boolean]> => {
    await resetUserWeb3Addresses(address)(tx);
    await tx<User>('users')
      .update({ web3_address: address })
      .where({ id: user.id })
      .returning('*');

    const web3Account = await tx<Web3Account>('web3_accounts')
      .select()
      .where({
        user_id: user?.id,
      })
      .first();

    if (!web3Account) {
      return [
        (
          await tx<Web3Account>('web3_accounts')
            .insert({
              address,
              user_id: user.id,
              type,
              challenge,
            })
            .returning('*')
        )[0],
        true,
      ];
    }

    return [
      (
        await tx<Web3Account>('web3_accounts')
          .update({ challenge })
          .where({ user_id: user.id })
          .returning('*')
      )[0],
      false,
    ];
  };

export const updateOrInsertUserWeb3Address =
  (user: User, address: string, type: string, challenge: string) =>
  async (
    tx: Knex.Transaction
  ): Promise<[web3Account: Web3Account, isInsert: boolean]> => {
    const web3Account = await tx<Web3Account>('web3_accounts')
      .select()
      .where({
        user_id: user?.id,
      })
      .orWhere({ address })
      .first();
    if (!web3Account) {
      return [
        (
          await tx<Web3Account>('web3_accounts')
            .insert({
              address,
              user_id: user.id,
              type,
              challenge,
            })
            .returning('*')
        )[0],
        true,
      ];
    }
    return [
      (
        await tx<Web3Account>('web3_accounts')
          .update({ user_id: user.id, address })
          .where({ user_id: user.id })
          .orWhere({ address })
          .returning('*')
      )[0],
      false,
    ];
  };

export const insertUserByDisplayName =
  (displayName: string, username: string, email?: string, password?: string) =>
  async (tx: Knex.Transaction) =>
    (
      await tx<User>('users')
        .insert({
          display_name: displayName,
          username: username,
          email: email,
          password: password,
        })
        .returning('*')
    )[0];

export const generateGetStreamToken = async (user: User) => {
  if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_SECRET_KEY) {
    const client: StreamChat = new StreamChat(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_SECRET_KEY
    );
    const token = client.createToken(String(user?.id));
    await client.upsertUser({
      id: String(user?.id),
      name: user?.display_name,
      username: user?.username,
      profile_photo: user?.profile_photo,
    });
    return token;
  }
  return '';
};

export const updateGetStreamUserName = async (user: User) => {
  if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_SECRET_KEY) {
    const client: StreamChat = new StreamChat(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_SECRET_KEY
    );
    const resp = await client.partialUpdateUser({
      id: String(user.id),
      set: {
        name: user.display_name,
        username: user.username,
        profile_photo: user.profile_photo,
      },
    });

    return resp;
  }
  return '';
};

export const updateUserGetStreamToken =
  (id: number, token: string) => async (tx: Knex.Transaction) =>
    (
      await tx<User>('users')
        .where({ id })
        .update({
          getstream_token: token,
        })
        .returning('*')
    )[0];

export const insertToTable =
  (item: string, table_name: string) => async (tx: Knex.Transaction) =>
    (
      await tx(table_name)
        .insert({
          name: item.toLowerCase(),
        })
        .returning('*')
    )[0];

export const insertToFreelancerClientsTable =
  (
    item: { name: string; website?: string; logo?: string },
    table_name: string
  ) =>
  async (tx: Knex.Transaction) =>
    (
      await tx(table_name)
        .insert({
          name: item.name.toLowerCase(),
          website: item?.website || '',
          logo: item?.logo || '',
        })
        .returning('*')
    )[0];

export const updateFederatedLoginUser =
  (user: User, username: string, email: string, password?: string) =>
  async (tx: Knex.Transaction) =>
    (
      await tx<User>('users')
        .update({
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: password,
        })
        .where({
          id: user.id,
        })
        .returning('*')
    )[0];

export const fetchUserLastNotificationId =
  (id: number) => async (tx: Knex.Transaction) =>
    (await tx<User>('users').select('last_notification_id').where({ id }))[0];
export const updateUserLastNotificationId =
  (id: number, notificationId: string) => async (tx: Knex.Transaction) =>
    await tx<User>('users')
      .where({ id })
      .update({ last_notification_id: notificationId });

export const getApproverProjects =
  (wallet: string | string[]) => async (tx: Knex.Transaction) =>
    await tx<Project>('project_approvers')
      .leftJoin('projects', 'project_approvers.project_id', '=', 'projects.id')
      .select()
      .where({ approver: wallet })
      .orderBy('projects.created', 'desc');

export const insertProject =
  (project: Project) => async (tx: Knex.Transaction) =>
    (await tx<Project>('projects').insert(project).returning('*'))[0];

export const insertUserAnalytics =
  (user_analytics: any) => async (tx: Knex.Transaction) =>
    (await tx('user_analytic').insert(user_analytics).returning('*'))[0];
export const updateUserAnalytics =
  (user_id: number, analytics: any) => async (tx: Knex.Transaction) =>
    (
      await tx('user_analytic')
        .where({ user_id })
        .update(analytics)
        .returning('*')
    )[0];

export const getUserAnalytics =
  (user_id: number) => async (tx: Knex.Transaction) =>
    (await tx('user_analytic').where({ user_id }))[0];

export const updateProject =
  (id: string | number, project: Project) => async (tx: Knex.Transaction) =>
    (
      await tx<Project>('projects').update(project).where({ id }).returning('*')
    )[0];

export const rejectOtherApplications =
  (briefID: string | number, projectID: string | number) =>
  async (tx: Knex.Transaction) =>
    (
      await tx<Project>('projects')
        .where({ brief_id: briefID })
        .whereNot({ id: projectID })
        .update({ status_id: ProjectStatus.Rejected })
        .returning('*')
    )[0];

export const updateProjectProperties =
  (id: string | number, properties: ProjectProperties) =>
  async (tx: Knex.Transaction) =>
    (
      await tx<ProjectProperties>('project_properties')
        .update(properties)
        .where({ project_id: id })
        .returning('*')
    )[0];

export const fetchUserBriefApplications =
  (user_id: string | number, brief_id: string | number) =>
  (tx: Knex.Transaction) =>
    tx<Project>('projects').select().where({ user_id, brief_id }).first();

export const fetchBriefProject =
  (id: string | number, brief_id: string | undefined) =>
  (tx: Knex.Transaction) =>
    tx<Project>('projects')
      .select()
      .where({ id: id, brief_id: brief_id })
      .first();

export const fetchProjectById =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx<Project>('projects').select().where({ id: id }).first();

export const fetchGrantProject =
  (project_id: number) => (tx: Knex.Transaction) =>
    tx<Project>('projects')
      .select()
      .where({ chain_project_id: project_id })
      .first();

export const acceptBriefApplication =
  (id: string | number, project_id: number) => async (tx: Knex.Transaction) =>
    (
      await tx<Brief>('briefs')
        .update({
          project_id: project_id,
        })
        .where({
          id,
        })
        .returning('*')
    )[0];

export const fetchProjectWithProperties =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx<Project>('projects')
      .join(
        'project_properties',
        'projects.id',
        '=',
        'project_properties.project_id'
      )
      .select()
      .where({ project_id: id })
      .first();

export const fetchAllProjects = () => (tx: Knex.Transaction) =>
  tx('projects').select();

export const fetchUserProject =
  (id: string | number) => (tx: Knex.Transaction) =>
    fetchAllProjects()(tx).where({ id: id }).first();
export const fetchUserProjects =
  (id: string | number) => (tx: Knex.Transaction) =>
    fetchAllProjects()(tx).where({ user_id: id }).orderBy('created', 'desc');

export const fetchUserOnGoingProjects =
  (id: string | number, skip: number, limit: number) =>
  (tx: Knex.Transaction) =>
    fetchAllProjects()(tx)
      .where({ user_id: id })
      .whereNot({ chain_project_id: null })
      .offset(skip)
      .limit(limit);

export const insertMilestones = (
  milestones: ProposedMilestone[],
  project_id: string | number
) => {
  const values = milestones.map((m, idx) => {
    const mileston = m;
    delete mileston.attachments;

    return {
      ...mileston,
      project_id,
      milestone_index: idx,
    };
  });

  return (tx: Knex.Transaction) =>
    tx<Milestone>('milestones').insert(values).returning('*');
};

export const deleteMilestones =
  (project_id: string | number) => (tx: Knex.Transaction) =>
    tx<Milestone>('milestones').delete().where({ project_id });

export const fetchProjectMilestones =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx<Milestone>('milestones')
      .select()
      .where({ project_id: id })
      .orderBy('milestone_index');

export const fetchProjectApprovers =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx<Milestone>('project_approvers')
      .select('approver')
      .where({ project_id: id });

export const fetchProjectApproverUserIds =
  (id: string | number) => async (tx: Knex.Transaction) =>
    (
      await tx<User>('project_approvers')
        .select('users.id')
        .join(
          'web3_accounts',
          'project_approvers.approver',
          'web3_accounts.address'
        )
        .join('users', 'web3_accounts.user_id', 'users.id')
        .where('project_approvers.project_id', '=', id)
        .returning('users.id')
    ).map((row) => row.id);

export const updateProjectVoting =
  (id: string | number, voting: boolean) => (tx: Knex.Transaction) =>
    tx('projects')
      .where({ id: id })
      .update('project_in_milestone_voting', voting)
      .returning('project_in_milestone_voting');

export const updateFirstPendingMilestoneService =
  (id: string | number, milestone_index: number) => (tx: Knex.Transaction) =>
    tx<Project>('projects')
      .where({ id: id })
      .update('first_pending_milestone', milestone_index);
// .returning('project_in_milestone_voting');

export const updateMilestoneDetails =
  (id: string | number, milestoneId: string | number, details: string) =>
  (tx: Knex.Transaction) =>
    tx<MilestoneDetails>('milestone_details')
      .where({ project_id: id })
      .where('index', '=', milestoneId)
      .update('details', details)
      .returning('*');

export const updateMilestone =
  (id: string | number, milestoneId: string | number, details: any) =>
  (tx: Knex.Transaction) =>
    tx<Milestone>('milestones')
      .where({ project_id: id })
      .where('milestone_index', '=', milestoneId)
      .update(details)
      .returning('*');

export const updateMilestoneWithdrawHashs =
  (
    projectId: number,
    milestoneIds: number[],
    tx_hash: string,
    imbue_fee_tx_hash: string
  ) =>
  (tx: Knex.Transaction) =>
    tx<Milestone>('milestones')
      .where(`project_id`, projectId)
      .whereIn(`milestone_index`, milestoneIds)
      .update({
        withdrawal_transaction_hash: tx_hash,
        imbue_fee_transaction_hash: imbue_fee_tx_hash,
        withdrawn_offchain: true,
      })
      .returning('*');

export const updateMilestoneWithdrawStatus =
  (projectId: number, milestoneIds: number[]) => (tx: Knex.Transaction) =>
    tx<Milestone>('milestones')
      .where(`project_id`, projectId)
      .whereIn(`milestone_index`, milestoneIds)
      .update({
        withdrawn_onchain: true,
      })
      .returning('*');

export const insertMilestoneDetails =
  (value: MilestoneDetails) => async (tx: Knex.Transaction) =>
    (
      await tx<MilestoneDetails>('milestone_details')
        .insert(value)
        .returning('*')
    )[0];

export const fetchAllMilestone =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx<MilestoneDetails>('milestone_details').where('project_id', '=', id);

export const fetchMilestoneByIndex =
  (projectId: string | number, milestoneId: string | number) =>
  (tx: Knex.Transaction) =>
    tx<MilestoneDetails>('milestone_details')
      .select()
      .where({ project_id: projectId })
      .where('index', '=', milestoneId);

export const fetchBriefApplications =
  (id: string | string[]) => (tx: Knex.Transaction) =>
    fetchAllProjects()(tx).where({ brief_id: id }).select();

export const fetchBriefProjects =
  (brief_id: string) => (tx: Knex.Transaction) =>
    fetchAllProjects()(tx).where({ brief_id }).select();

export const fetchAcceptedBriefs =
  (user_id: string) => (tx: Knex.Transaction) =>
    fetchAllBriefs()(tx).where({ user_id }).select();

export const fetchBrief = (id: string | string[]) => (tx: Knex.Transaction) =>
  fetchAllBriefs()(tx).where({ 'briefs.id': id }).first();

export const fetchUserBriefs =
  (user_id: string | number) => (tx: Knex.Transaction) =>
    fetchAllBriefs()(tx).where({ user_id }).select();

export const fetchAllBriefs = () => (tx: Knex.Transaction) =>
  tx
    .select(
      'briefs.id',
      'headline',
      'description',
      'scope.scope_level',
      'briefs.scope_id',
      'duration.duration',
      'briefs.duration_id',
      'budget',
      'users.display_name as created_by',
      'users.profile_photo as owner_photo',
      'users.username as owner_name',
      'users.created as joined',
      'experience_level',
      'briefs.experience_id',
      'briefs.created',
      'briefs.user_id',
      'briefs.project_id',
      'briefs.verified_only',
      'users.briefs_submitted as number_of_briefs_submitted',
      tx.raw('ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills'),
      tx.raw('ARRAY_AGG(DISTINCT CAST(skills.id as text)) as skill_ids'),
      tx.raw('ARRAY_AGG(DISTINCT CAST(industries.name as text)) as industries'),
      tx.raw('ARRAY_AGG(DISTINCT CAST(industries.id as text)) as industry_ids')
    )
    .from('briefs')
    .leftJoin('brief_industries', { 'briefs.id': 'brief_industries.brief_id' })
    .leftJoin('industries', { 'brief_industries.industry_id': 'industries.id' })
    .leftJoin('brief_skills', { 'briefs.id': 'brief_skills.brief_id' })
    .leftJoin('skills', { 'brief_skills.skill_id': 'skills.id' })
    .leftJoin('experience', { 'briefs.experience_id': 'experience.id' })
    .leftJoin('scope', { 'briefs.scope_id': 'scope.id' })
    .leftJoin('duration', { 'briefs.duration_id': 'duration.id' })
    .innerJoin('users', { 'briefs.user_id': 'users.id' })
    .orderBy('briefs.created', 'desc')
    .groupBy('briefs.id')
    .groupBy('scope.scope_level')
    .groupBy('duration.duration')
    .groupBy('users.display_name')
    .groupBy('briefs.experience_id')
    .groupBy('experience.experience_level')
    .groupBy('users.id')
    .groupBy('users.username');

export const fetchAllGrants = () => (tx: Knex.Transaction) =>
  tx
    .select(
      'grants.id',
      'grants.title',
      'grants.description',
      'grants.duration_id',
      'duration.duration',
      'grants.budget',
      'grants.currency_id',
      'users.display_name as created_by',
      'grants.created',
      'grants.user_id',
      'grants.project_id'
    )
    .from('grants')
    .leftJoin('duration', { 'grants.duration_id': 'duration.id' })
    .innerJoin('users', { 'grants.user_id': 'users.id' })
    .orderBy('grants.created', 'desc');

export const countAllBriefs = () => async (tx: Knex.Transaction) =>
  tx('briefs').count('id').whereNull('briefs.project_id').first();

export const fetchProfileImages =
  (id: number, tableName: string) => async (tx: Knex.Transaction) =>
    tx(tableName).select('profile_image').where({ user_id: id }).first();

export const fetchAllImbueSkills = (limit: number) => (tx: Knex.Transaction) =>
  tx<Skill>('imbue_skills').select().limit(limit);

export const allImbueSkillsSuggestion =
  (limit: number) => (tx: Knex.Transaction) =>
    tx<Skill>('imbue_skills').select().offset(980).limit(limit);

export const searchImbueSkillsByName =
  (name: string) => (tx: Knex.Transaction) =>
    tx<Skill>('imbue_skills')
      .select()
      .where('name', 'ilike', `${name}%`)
      .limit(10);

export const searchIndustryByName = (name: string) => (tx: Knex.Transaction) =>
  tx<Skill>('industries').select().where('name', 'ilike', `${name}%`).limit(10);

export const searchLanguageByName = (name: string) => (tx: Knex.Transaction) =>
  tx<Skill>('languages').select().where('name', 'ilike', `${name}%`).limit(10);

// Insert a brief and their respective skill and industry_ids.
export const insertBrief =
  (
    brief: any,
    skill_ids: number[],
    industry_ids: number[],
    scope_id: number,
    duration_id: number
  ) =>
  async (tx: Knex.Transaction) =>
    await tx('briefs')
      .insert({
        headline: brief.headline,
        description: brief.description,
        duration_id: duration_id,
        scope_id: scope_id,
        user_id: brief.user_id,
        budget: brief.budget,
        experience_id: brief.experience_id,
        verified_only: brief.verified_only,
      })
      .returning('briefs.id')
      .then(async (ids) => {
        if (skill_ids) {
          skill_ids.forEach(async (skillId) => {
            if (skillId) {
              await tx('brief_skills').insert({
                brief_id: ids[0],
                skill_id: skillId,
              });
            }
          });
        }

        if (industry_ids) {
          industry_ids.forEach(async (industry_id) => {
            if (industry_id) {
              await tx('brief_industries').insert({
                brief_id: ids[0],
                industry_id: industry_id,
              });
            }
          });
        }
        return ids[0];
      });

// save a brief
export const insertSavedBrief =
  (brief: any, scope_id: number, duration_id: number, user_id: number) =>
  async (tx: Knex.Transaction) => {
    return await tx('saved_briefs')
      .select('*')
      .where({ user_id: user_id, brief_id: brief.id })
      .then(async (ids) => {
        if (ids.length === 0) {
          return await tx('saved_briefs')
            .insert({
              user_id: user_id,
              brief_id: brief.id,
            })
            .returning('saved_briefs.id')
            .then(async (ids) => {
              return ids[0];
            });
        } else {
          return {
            status: 'Brief already saved',
          };
        }
      });
  };

export const getSavedBriefs =
  (user_id: string) => async (tx: Knex.Transaction) => {
    const briefs = await fetchAllBriefs()(tx);
    const saved_briefs = await tx('saved_briefs').select('*');

    const saved_brief_data = await briefs.filter((brief) => {
      return saved_briefs.some((saved_brief) => {
        return (
          brief.id === saved_brief.brief_id &&
          parseInt(saved_brief.user_id) === parseInt(user_id, 10)
        );
      });
    });

    return saved_brief_data;
  };

export const findSavedBriefById =
  (brief_id: string, userId: string) => async (tx: Knex.Transaction) =>
    await tx('saved_briefs')
      .where({ brief_id: brief_id, user_id: userId })
      .first();

export const deleteSavedBrief =
  (brief_id: string, userId: string) => async (tx: Knex.Transaction) => {
    await tx('saved_briefs')
      .where({ brief_id: brief_id, user_id: userId })
      .delete()
      .returning('*');

    return getSavedBriefs(userId)(tx);
  };

export const updateBrief =
  (
    headline: string,
    description: string,
    scope_id: number,
    experience_id: number,
    duration_id: number,
    budget: bigint,
    brief_id: number | string,
    skill_ids: number[],
    industry_ids: number[],
    verified_only: boolean
  ) =>
  async (tx: Knex.Transaction) =>
    await tx<Brief>('briefs')
      .update({
        headline: headline,
        description: description,
        scope_id: scope_id,
        duration_id: duration_id,
        budget: budget,
        experience_id: experience_id,
        verified_only,
      })
      .where({ id: brief_id })
      .returning('briefs.id')
      .then(async (ids) => {
        if (skill_ids) {
          await tx('brief_skills').where({ brief_id: ids[0] }).delete();

          skill_ids.forEach(async (skillId) => {
            if (skillId) {
              await tx('brief_skills').insert({
                brief_id: ids[0],
                skill_id: skillId,
              });
            }
          });
        }

        if (industry_ids) {
          await tx('brief_industries').where({ brief_id: ids[0] }).delete();

          industry_ids.forEach(async (industry_id) => {
            if (industry_id) {
              await tx('brief_industries').insert({
                brief_id: ids[0],
                industry_id: industry_id,
              });
            }
          });
        }
        return ids[0];
      });

export const incrementUserBriefSubmissions =
  (id: number) => async (tx: Knex.Transaction) =>
    tx<User>('users').where({ id: id }).increment('briefs_submitted', 1);

export const insertFederatedCredential =
  (id: number, issuer: string, subject: string) =>
  async (tx: Knex.Transaction) =>
    (
      await tx<FederatedCredential>('federated_credentials')
        .insert({
          id,
          issuer,
          subject,
        })
        .returning('*')
    )[0];

export const upsertItems =
  (items: any, tableName: string) => async (tx: Knex.Transaction) => {
    const item_ids: number[] = [];
    try {
      //TODO Convert to map
      for (const item of items) {
        let item_id: number;
        const existing_item = await tx(tableName)
          .select()
          .where({
            name: item.toLowerCase(),
          })
          .first();

        if (!existing_item) {
          item_id = await (await insertToTable(item, tableName)(tx)).id;
        } else item_id = existing_item.id;

        item_ids.push(item_id);
      }
    } catch (err) {
      console.log('Failed to insert new item ', err);
    }
    return item_ids;
  };

export const upsertFreelancerClientsItems =
  (items: any, tableName: string) => async (tx: Knex.Transaction) => {
    const item_ids: number[] = [];
    try {
      //TODO Convert to map
      for (const item of items) {
        let item_id: number;
        const existing_item = await tx(tableName)
          .select()
          .where({
            name: item?.name?.toLowerCase(),
          })
          .first();

        if (!existing_item) {
          item_id = await (
            await insertToFreelancerClientsTable(item, tableName)(tx)
          ).id;
        } else item_id = existing_item.id;

        item_ids.push(item_id);
      }
    } catch (err) {
      console.log('Failed to insert new item ', err);
    }
    return item_ids;
  };

export const getOrCreateFederatedUser = (
  issuer: string,
  username: string,
  displayName: string,
  done: CallableFunction,
  email?: string,
  password?: string
) => {
  db.transaction(async (tx) => {
    let user: User;
    try {
      /**
       * Do we already have a federated_credential ?
       */
      const federated = await tx<FederatedCredential>('federated_credentials')
        .select()
        .where({
          subject: username,
        })
        .first();

      /**
       * If not, create the `user`, then the `federated_credential`
       */
      if (!federated) {
        user = await insertUserByDisplayName(
          displayName,
          username,
          email,
          password
        )(tx);
        await insertFederatedCredential(user.id, issuer, username)(tx);
      } else {
        const user_ = await db
          .select()
          .from<User>('users')
          .where({
            id: federated.id,
          })
          .first();

        if (!user_) {
          throw new Error(
            `Unable to find matching user by \`federated_credential.id\`: ${federated.id}`
          );
        }
        user = user_;
      }

      if (!user.getstream_token) {
        const token = await generateGetStreamToken(user);
        await updateUserGetStreamToken(user.id, token)(tx);
      }

      done(null, user);
    } catch (err) {
      done(new Error(`Failed to upsert federated authentication. ${err}`));
    }
  });
};

export const fetchFreelancerDetailsByUserID =
  (user_id: number | string) => (tx: Knex.Transaction) =>
    fetchAllFreelancers()(tx).where({ 'freelancers.user_id': user_id }).first();

export const fetchFreelancerDetailsByUsername =
  (username: string | string[]) => (tx: Knex.Transaction) =>
    fetchAllFreelancers()(tx).where({ username: username }).first();

export const searchFreelancerProfile = (query: any) => (tx: Knex.Transaction) =>
  fetchAllFreelancers()(tx).where({
    display_name: query?.search_input,
  });

export const fetchAllFreelancers = () => (tx: Knex.Transaction) =>
  tx
    .select(
      'freelancers.id',
      'freelanced_before',
      'freelancing_goal',
      'work_type',
      'education',
      'experience',
      'facebook_link',
      'twitter_link',
      'telegram_link',
      'discord_link',
      'title',
      'hour_per_rate',
      // 'bio',
      'freelancers.user_id',
      'username',
      'users.profile_photo as profile_image',
      'display_name',
      'web3_accounts.address as web3_address',
      'freelancers.created',
      'verified',
      'users.country',
      'users.region',
      'users.about'
      // tx.raw('ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills'),
      // tx.raw('ARRAY_AGG(DISTINCT CAST(skills.id as text)) as skill_ids'),

      // tx.raw('ARRAY_AGG(DISTINCT CAST(languages.name as text)) as languages'),
      // tx.raw('ARRAY_AGG(DISTINCT CAST(languages.id as text)) as language_ids'),

      // tx.raw('ARRAY_AGG(DISTINCT CAST(services.name as text)) as services'),
      // tx.raw('ARRAY_AGG(DISTINCT CAST(services.id as text)) as service_ids'),

      // tx.raw('json_agg(clients.*) as clients'),object
      // tx.raw('ARRAY_AGG(DISTINCT CAST(clients.id as text)) as client_ids'),

      // tx.raw('ARRAY_AGG(DISTINCT CAST(clients.img as text)) as client_images'),
      // tx.raw(
      // 'ARRAY_AGG(DISTINCT CAST(clients.id as text)) as client_image_ids'
      // ),
      // tx.raw(
      // '(SUM(freelancer_ratings.rating) / COUNT(freelancer_ratings.rating)) as rating'
      // ),
      // tx.raw('COUNT(freelancer_ratings.rating) as num_ratings')
    )
    .from<Freelancer>('freelancers')
    // Join services and many to many
    // .leftJoin('freelancer_services', {
    // 'freelancers.id': 'freelancer_services.freelancer_id',
    // })
    // .leftJoin('services', { 'freelancer_services.service_id': 'services.id' })
    // Join clients and many to many
    // .leftJoin('freelancer_clients', {
    //   'freelancers.id': 'freelancer_clients.freelancer_id',
    // })
    // .leftJoin('clients', { 'freelancer_clients.client_id': 'clients.id' })
    // Join skills and many to many
    // .leftJoin('freelancer_skills', {
    // 'freelancers.id': 'freelancer_skills.freelancer_id',
    // })
    // .leftJoin('skills', { 'freelancer_skills.skill_id': 'skills.id' })
    // Join languages and many to many
    // .leftJoin('freelancer_languages', {
    // 'freelancers.id': 'freelancer_languages.freelancer_id',
    // })
    // .leftJoin('languages', {
    // 'freelancer_languages.language_id': 'languages.id',
    // })
    .innerJoin('users', { 'freelancers.user_id': 'users.id' })
    // .leftJoin("freelancer_skills", { 'freelancers.id': 'freelancer_skills.freelancer_id' })s
    // .leftJoin("freelancer_services", { 'freelancers.id': 'freelancer_services.freelancer_id' })
    // .leftJoin('freelancer_ratings', {
    // 'freelancers.id': 'freelancer_ratings.freelancer_id',
    // })
    .leftJoin('web3_accounts', {
      'freelancers.user_id': 'web3_accounts.user_id',
    })
    .orderBy('freelancers.id');

// order and group by many-many selects
// .orderBy('profile_image', 'asc')
// .orderBy('freelancers.modified', 'desc')
// .groupBy('freelancers.id')
// .groupBy('users.username')
// .groupBy('users.display_name')
// .groupBy('address')
// .groupBy('profile_image')
// TODO Add limit until we have spinning loading icon in freelancers page

export const countAllFreelancers = () => async (tx: Knex.Transaction) =>
  tx('freelancers').count('id');

export const fetchFreelancerMetadata =
  (type: string, freelancer_id: number) => async (tx: Knex.Transaction) =>
    tx
      .raw(
        `SELECT ARRAY_AGG(DISTINCT metadata.id) as ids FROM freelancer_${type}s freelancer_metadata
   LEFT JOIN ${type}s metadata on freelancer_metadata.${type}_id = metadata.id
   WHERE freelancer_metadata.freelancer_id = ${freelancer_id}`
      )
      .then(async (results) => {
        const ids = results.rows[0].ids;
        if (ids) {
          return await fetchItems(ids, `${type}s`)(tx);
        }
      });

// We need this function because the clients tables does not follow the same consistency as languages and skills
export const fetchFreelancerClients =
  (freelancer_id: number) => async (tx: Knex.Transaction) =>
    tx
      .raw(
        `SELECT ARRAY_AGG(DISTINCT metadata.id) as ids FROM freelancer_clients freelancer_metadata
   LEFT JOIN clients metadata on freelancer_metadata.client_id = metadata.id
   WHERE freelancer_metadata.freelancer_id = ${freelancer_id}`
      )
      .then(async (results) => {
        const ids = results.rows[0].ids;
        if (ids) {
          return await fetchClients(ids, `clients`)(tx);
        }
      });

export const freelancerProjects =
  (freelancer_id: number) => async (tx: Knex.Transaction) =>
    tx.select().where({ user_id: freelancer_id }).from('projects');

export const fetchItems =
  (ids: number[], tableName: string) => async (tx: Knex.Transaction) =>
    tx(tableName).select('id', 'name').whereIn(`id`, ids);

export const fetchClients =
  (ids: number[], tableName: string) => async (tx: Knex.Transaction) =>
    tx(tableName).select('id', 'name', 'logo', 'website').whereIn(`id`, ids);

export const insertFreelancerDetails =
  (
    f: Freelancer,
    skill_ids: number[],
    language_ids: number[],
    client_ids: number[],
    service_ids: number[]
  ) =>
  async (tx: Knex.Transaction) =>
    await tx<Freelancer>('freelancers')
      .insert({
        freelanced_before: f.freelanced_before.toString(),
        freelancing_goal: f.freelancing_goal,
        work_type: f.work_type,
        education: f.education,
        experience: f.experience,
        title: f.title,
        // bio: f.bio,
        facebook_link: f.facebook_link,
        twitter_link: f.twitter_link,
        telegram_link: f.telegram_link,
        discord_link: f.discord_link,
        user_id: f.user_id,
        hour_per_rate: f.hour_per_rate,
      })

      .returning('id')
      .then(async (ids) => {
        if (f.user_id) {
          await tx('users').where({ id: f.user_id }).update({
            about: f.about,
          });
        }

        if (skill_ids) {
          skill_ids.forEach(async (skillId) => {
            if (skillId) {
              await tx('freelancer_skills').insert({
                freelancer_id: ids[0],
                skill_id: skillId,
              });
            }
          });
        }

        if (language_ids) {
          language_ids.forEach(async (langId) => {
            if (langId) {
              await tx('freelancer_languages').insert({
                freelancer_id: ids[0],
                language_id: langId,
              });
            }
          });
        }

        if (client_ids) {
          client_ids.forEach(async (clientId) => {
            if (clientId) {
              await tx('freelancer_clients').insert({
                freelancer_id: ids[0],
                client_id: clientId,
              });
            }
          });
        }

        if (service_ids) {
          service_ids.forEach(async (serviceId) => {
            if (serviceId) {
              await tx('freelancer_services').insert({
                freelancer_id: ids[0],
                service_id: serviceId,
              });
            }
          });
        }

        return ids[0];
      });

export const updateFreelancerDetails =
  (
    userId: number,
    f: Freelancer,
    skill_ids: number[],
    language_ids: number[],
    client_ids: number[],
    service_ids: number[],
    profile_image: string,
    country: string,
    region: string,
    web3_address: string,
    web3_type: string,
    web3_challenge: string,
    // eslint-disable-next-line unused-imports/no-unused-vars
    freelancer_clients: Array<{ id: number; name: string; img: string }>,
    // token: string
    hour_per_rate: number
  ) =>
  async (tx: Knex.Transaction) =>
    await tx<Freelancer>('freelancers')
      .update({
        freelanced_before: f.freelanced_before,
        freelancing_goal: f.freelancing_goal,
        work_type: f.work_type,
        education: f.education,
        experience: f.experience,
        title: f.title,
        // bio: f.bio,
        facebook_link: f.facebook_link,
        twitter_link: f.twitter_link,
        telegram_link: f.telegram_link,
        discord_link: f.discord_link,
        user_id: f.user_id,
        hour_per_rate,
      })
      .where({ user_id: userId })
      .returning('id')
      .then(async (ids) => {
        if (userId) {
          await tx('users').where({ id: userId }).update({
            display_name: f.display_name,
            username: f.username,
            country: country,
            region: region,
            // getstream_token: token,
            about: f.about,
          });
        }

        if (userId && country && region) {
          await tx('freelancer_country').where({ user_id: userId }).delete();

          await tx('freelancer_country').where({ user_id: userId }).insert({
            country: country,
            region: region,
            freelancer_id: ids[0],
            user_id: userId,
          });
        }
        if (userId && web3_address && web3_type && web3_challenge) {
          await tx('web3_accounts').where({ user_id: userId }).delete();

          await tx('web3_accounts').where({ user_id: userId }).insert({
            address: web3_address,
            type: web3_type,
            challenge: web3_challenge,
            user_id: userId,
          });
        }
        if (userId && profile_image) {
          await tx('freelancer_profile_image')
            .where({ user_id: userId })
            .delete();

          await tx('freelancer_profile_image')
            .where({ user_id: userId })
            .insert({
              profile_image: profile_image,
              freelancer_id: ids[0],
              user_id: userId,
            });

          await tx<User>('users')
            .update({
              profile_photo: profile_image,
            })
            .where({ id: userId });
        }

        if (skill_ids) {
          await tx('freelancer_skills')
            .where({ freelancer_id: ids[0] })
            .delete();

          skill_ids.forEach(async (skillId) => {
            if (skillId) {
              await tx('freelancer_skills').insert({
                freelancer_id: ids[0],
                skill_id: skillId,
              });
            }
          });
        }

        if (language_ids) {
          await tx('freelancer_languages')
            .where({ freelancer_id: ids[0] })
            .delete();

          language_ids.forEach(async (langId) => {
            if (langId) {
              await tx('freelancer_languages').insert({
                freelancer_id: ids[0],
                language_id: langId,
              });
            }
          });
        }

        if (client_ids) {
          await tx('freelancer_clients')
            .where({ freelancer_id: ids[0] })
            .delete();

          client_ids.forEach(async (clientId) => {
            if (clientId) {
              await tx('freelancer_clients').insert({
                freelancer_id: ids[0],
                client_id: clientId,
              });
            }
          });
        }

        if (service_ids) {
          await tx('freelancer_services')
            .where({ freelancer_id: ids[0] })
            .delete();

          service_ids.forEach(async (serviceId) => {
            if (serviceId) {
              await tx('freelancer_services').insert({
                freelancer_id: ids[0],
                service_id: serviceId,
              });
            }
          });
        }

        return ids[0];
      });

// The search briefs and all these lovely parameters.
// Since we are using checkboxes only i unfortunatly ended up using all these parameters.
// Because we could have multiple ranges of values and open ended ors.
export const searchBriefs =
  (filter: BriefSqlFilter) => async (tx: Knex.Transaction) =>
    // select everything that is associated with brief.
    fetchAllBriefs()(tx)
      .distinct('briefs.id')
      .whereNull('briefs.project_id')
      .modify(function (builder) {
        if (filter?.items_per_page > 0)
          builder
            .offset(
              (Number(filter.page) - 1) * Number(filter.items_per_page) || 0
            )
            .limit(Number(filter.items_per_page) || 5);
      })
      .where(function () {
        if (filter.submitted_range?.length > 0) {
          this.whereBetween('users.briefs_submitted', [
            filter.submitted_range[0].toString(),
            Math.max(...filter.submitted_range).toString(),
          ]);
        }
        if (filter.submitted_is_max) {
          this.orWhere(
            'users.briefs_submitted',
            '>=',
            Math.max(...filter.submitted_range)
          );
        }
      })
      .where(function () {
        if (filter.experience_range?.length > 0) {
          this.whereIn('experience_id', filter.experience_range);
        }
      })
      .where(function () {
        if (filter?.length_range?.length > 0) {
          this.whereIn('duration_id', filter.length_range);
        }
        if (filter?.length_is_max) {
          this.orWhere('duration_id', '>=', Math.max(...filter.length_range));
        }
      })
      .where(function () {
        if (filter?.verified_only && !filter?.non_verified) {
          this.where('verified_only', true);
        }
      })
      .where(function () {
        if (filter?.skills_range?.length > 0) {
          this.whereIn('brief_skills.skill_id', filter.skills_range);
        }
      })
      .where(function () {
        if (filter?.non_verified && !filter?.verified_only) {
          this.where('verified_only', false);
        }
      })
      .where('headline', 'ilike', '%' + filter.search_input + '%');
// .where('headline', '~', `\\` + filter.search_input);

export const searchBriefsCount =
  (filter: BriefSqlFilter) => async (tx: Knex.Transaction) =>
    // select everything that is associated with brief.
    searchBriefs(filter)(tx).then((res) => res?.length);

export const paginatedData = (
  currentPage: number,
  itemsPerPage: number,
  data: any[]
): PagerProps => {
  const offset = (currentPage - 1) * itemsPerPage;
  const paginatedItems = data.slice(offset).slice(0, itemsPerPage);

  return {
    totalItems: data.length,
    currentData: paginatedItems,
  };
};

export const searchFreelancers =
  (filter: FreelancerSqlFilter) => (tx: Knex.Transaction) =>
    tx
      .select(
        'freelancers.id',
        'freelanced_before',
        'freelancing_goal',
        'work_type',
        'education',
        'experience',
        'facebook_link',
        'twitter_link',
        'telegram_link',
        'discord_link',
        'title',
        // 'bio',
        'freelancers.user_id',
        'username',
        'users.profile_photo as profile_image',
        'display_name',
        'web3_accounts.address as web3_address',
        'freelancers.created',
        'verified',
        'users.country',
        'users.region',
        'users.about'
      )
      .from<Freelancer>('freelancers')
      .innerJoin('users', { 'freelancers.user_id': 'users.id' })
      .leftJoin('freelancer_skills', {
        'freelancers.id': 'freelancer_skills.freelancer_id',
      })
      .leftJoin('freelancer_services', {
        'freelancers.id': 'freelancer_services.freelancer_id',
      })
      .leftJoin('freelancer_languages', {
        'freelancers.id': 'freelancer_languages.freelancer_id',
      })
      .leftJoin('web3_accounts', {
        'freelancers.user_id': 'web3_accounts.user_id',
      })
      .orderBy('freelancers.id')
      .where(function () {
        if (filter?.skills_range?.length > 0) {
          this.whereIn('freelancer_skills.skill_id', filter.skills_range);
        }
      })
      .where(function () {
        if (filter.services_range?.length > 0) {
          this.whereIn('freelancer_services.service_id', filter.services_range);
        }
      })
      .where(function () {
        if (filter.languages_range?.length > 0) {
          this.whereIn(
            'freelancer_languages.language_id',
            filter.languages_range
          );
        }
      })
      .where(function () {
        if (filter?.verified) {
          this.where('verified', true);
        }
      })
      .where(function () {
        if (filter?.name) {
          this.where('display_name', 'ilike', `%${filter.name}%`);
        }
      })
      .distinct('freelancers.id');
// .modify(function (builder) {
//   if (Number(filter?.items_per_page) > 0) {
//     builder
//       .offset(
//         (Number(filter.page) - 1) * Number(filter.items_per_page) || 0
//       )
//       .limit(Number(filter.items_per_page) || 5);
//   }
// });

export const searchFreelancersCount = async (
  tx: Knex.Transaction,
  filter: FreelancerSqlFilter
) =>
  searchFreelancers(filter)(tx).then((freelancers) => freelancers?.length || 0);

export const getFreelancerBySkills =
  (skills: Array<number>) => async (tx: Knex.Transaction) =>
    tx(`freelancer_skills`)
      .select(`freelancer_id as id`)
      .whereIn('skill_id', skills);

export const getFreelancerFilterItems =
  (item: string) => async (tx: Knex.Transaction) =>
    tx(`freelancer_${item}s`)
      .distinct(`${item}_id as id`)
      .join(`${item}s`, `freelancer_${item}s.${item}_id`, '=', `${item}s.id`)
      .select(`${item}s.name`)
      .orderBy('name');

export const getBriefFilterItems =
  (item: string) => async (tx: Knex.Transaction) =>
    tx(`brief_${item}s`)
      .distinct(`${item}_id as id`)
      .join(`${item}s`, `brief_${item}s.${item}_id`, '=', `${item}s.id`)
      .select(`${item}s.name`)
      .orderBy('name');

export const insertGrant = (grant: Grant) => async (tx: Knex.Transaction) => {
  const {
    title,
    description,
    required_funds,
    total_cost_without_fee,
    imbue_fee,
    owner,
    currency_id,
    milestones,
    approvers,
    chain_project_id,
    user_id,
    escrow_address,
    duration_id,
    payment_address,
  } = grant;
  const project = await insertProject({
    name: title,
    logo: '',
    description,
    website: '',
    category: 0,
    required_funds,
    currency_id,
    chain_project_id,
    escrow_address,
    owner,
    user_id,
    total_cost_without_fee,
    imbue_fee,
    duration_id,
    status_id: ProjectStatus.Accepted,
    payment_address,
    // project_type: project_type ?? models.ProjectType.Brief
  })(tx);

  if (project.id === undefined) {
    return new Error('Failed to insert project');
  }

  await insertMilestones(milestones, project.id)(tx);

  for await (const approver of approvers) {
    await tx('project_approvers').insert({
      project_id: project.id,
      approver,
    });
  }
  return project.id;
};
