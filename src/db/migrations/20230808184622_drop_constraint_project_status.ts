import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableName = 'projects';
  await knex.schema.alterTable(tableName, (builder) => {
    builder.dropForeign('status_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  const tableName = 'projects';
  await knex.schema.alterTable(tableName, (builder) => {
    builder
      .foreign('status_id')
      .references('project_status.id')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
  });
}
