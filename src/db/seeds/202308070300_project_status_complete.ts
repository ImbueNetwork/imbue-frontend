import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // await knex('project_status').insert([
  //   { status: 'in progress' },
  //   { status: 'completed' },
  // ]);
  await knex('project_status').delete();

  await knex('project_status').insert([
    { id: 1, status: 'draft' },
    { id: 2, status: 'pending review' },
    { id: 3, status: 'rejected' },
    { id: 4, status: 'accepted' },
    { id: 5, status: 'in progress' },
    { id: 6, status: 'completed' },
  ]);
}
