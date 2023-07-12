import { Knex } from 'knex';

const table_projects = 'projects';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_projects, (builder) => {
    builder.text('escrow_address').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_projects, (builder) => {
    builder.dropColumn('escrow_address');
  });
}
