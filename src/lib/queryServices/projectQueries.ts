import { Knex } from 'knex';

import { User } from '@/model';

// export type NoConfidenceVoter = {
//   id?: number;
//   project_id: number;
//   user_id: number;
//   web3_address: string;
//   vote: boolean;
// };

export type NoConfidenceVote = {
  project_id: number;
  user_id: number;
  web3_address: string;
  vote: boolean;
};

export type NoConfidenceVoter = User & { vote: boolean };

// no confidence votes

export const insertToNoConfidenceVoters =
  (id: string | number, voter: NoConfidenceVote) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters')
      .where({ project_id: id })
      .insert(voter)
      .returning('id');

export const getNoConfidenceVotersByProjectId =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters').select().where({ project_id: id });

export const getNoConfidenceVotes =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters')
      .select('*', 'no_confidence_voters.web3_address')
      .where({ project_id: id })
      .leftJoin('users', 'no_confidence_voters.user_id', 'users.id');

// votes

// get votes

// export const getPendingVotes =
//   (projectId: string | string[] | number, milestoneIndex: string | number) =>
//   (tx: Knex.Transaction) =>
//     tx('project_approvers')
//       .select('*')
//       .innerJoin('project_votes', function () {
//         this.on('project_votes.project_id', '=', 'project_approvers.project_id')
//           .andOn(
//             'project_votes.voter_address',
//             '=',
//             'project_approvers.approver'
//           )
//           // .andOn(`milestone_index`, '=', milestoneIndex.toString());
//       })
//       .leftJoin('users', 'users.web3_address', 'project_approvers.approver')
//       .where({
//         'project_approvers.project_id': projectId,
//         'project_votes.vote': null,
//       });

export const getAllVoteAddress =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[] | number
  ) =>
  (tx: Knex.Transaction) =>
    tx('project_votes').select('voter_address').where({
      project_id: projectId,
      milestone_index: milestoneIndex,
    });

export const getPendingVotes =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[] | number
  ) =>
  (tx: Knex.Transaction) =>
    getAllVoteAddress(
      projectId,
      milestoneIndex
    )(tx).then(async (addresses: any) => {
      const addressArray = addresses.map(
        (address: any) => address.voter_address
      );

      return tx('project_approvers')
        .select('*')
        .where({
          'project_approvers.project_id': projectId,
        })
        .whereNotIn('approver', addressArray)
        .leftJoin('users', 'users.web3_address', 'project_approvers.approver');
    });

export const getYesOrNoVotes =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[],
    vote: boolean
  ) =>
  (tx: Knex.Transaction) =>
    tx('project_votes')
      .select('*')
      .where({
        project_id: projectId,
        milestone_index: milestoneIndex,
        vote: vote,
      })
      .rightJoin('users', 'users.web3_address', 'project_votes.voter_address');

export const checkExistingVote =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[],
    voterAddress: string | string[]
  ) =>
  (tx: Knex.Transaction) =>
    tx('project_votes')
      .select('id', 'vote')
      .where({
        project_id: projectId,
        milestone_index: milestoneIndex,
        voter_address: voterAddress,
      })
      .first();

// post/update votes

export const addVoteToDB =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[],
    voterAddress: string | string[],
    userId: string | string[],
    vote: boolean
  ) =>
  (tx: Knex.Transaction) =>
    tx('project_votes')
      .insert({
        project_id: Number(projectId),
        milestone_index: Number(milestoneIndex),
        user_id: Number(userId),
        voter_address: voterAddress,
        vote,
      })
      .returning('id');

export const updateVoteDB =
  (
    projectId: string | string[] | number,
    milestoneIndex: string | string[],
    vote: boolean,
    voterAddress: string | string[]
  ) =>
  (tx: Knex.Transaction) =>
    tx('project_votes')
      .update({
        vote,
      })
      .where({
        project_id: Number(projectId),
        milestone_index: Number(milestoneIndex),
        voter_address: voterAddress,
      });
