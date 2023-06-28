import { Knex } from 'knex';

const table_projects = 'projects';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_projects, (builder) => {
    builder.text('grant_address').nullable();
    builder.integer('project_id').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_projects, (builder) => {
    builder.dropColumn('grant_address');
    builder.dropColumn('project_id');
  });
}
