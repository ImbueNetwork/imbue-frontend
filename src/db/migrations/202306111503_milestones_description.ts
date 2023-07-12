import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.text('description');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (builder) => {
    builder.dropColumn('description');
  });
}
