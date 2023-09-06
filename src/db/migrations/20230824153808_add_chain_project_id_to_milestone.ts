import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.integer('chain_project_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.dropColumn('chain_project_id');
  });
}
