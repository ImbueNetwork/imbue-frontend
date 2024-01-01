import { Knex } from 'knex';

export const deleteAllBriefApplications =
  (briefId: string | string[] | number) => (tx: Knex.Transaction) =>
    tx('projects')
      .where({
        brief_id: briefId,
      })
      .del();

export const deleteBriefIndustries =
  (briefId: string | string[] | number) => (tx: Knex.Transaction) =>
    tx('brief_industries')
      .where({
        brief_id: briefId,
      })
      .del();

export const deleteBriefSkills =
  (briefId: string | string[] | number) => (tx: Knex.Transaction) =>
    tx('brief_skills')
      .where({
        brief_id: briefId,
      })
      .del();
