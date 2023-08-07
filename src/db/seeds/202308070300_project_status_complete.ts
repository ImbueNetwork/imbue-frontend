import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('project_status').insert([
    { status: 'in progress' },
    { status: 'completed' },
  ]);
}
