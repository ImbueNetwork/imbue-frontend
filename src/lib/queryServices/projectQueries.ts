import { Knex } from 'knex';

export type NoConfidenceVoter = {
  id?: number;
  project_id: number;
  user_id: number;
  username: string;
  display_name: string;
  profile_photo: string;
  web3_address: string;
};

export const insertToNoConfidenceVoters =
  (id: string | number, voter: NoConfidenceVoter) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters')
      .where({ project_id: id })
      .insert(voter)
      .returning('id');

export const getNoConfidenceVotersByProjectId =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters').select().where({ project_id: id });

export const getNoConfidenceVotersAddress =
  (id: string | number) => (tx: Knex.Transaction) =>
    tx('no_confidence_voters').select('web3_address').where({ project_id: id });
