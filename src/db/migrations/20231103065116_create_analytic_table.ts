import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableName = 'user_analytic';
  await knex.schema.createTable(tableName, (builder) => {
    builder.increments('id', { primaryKey: true });
    builder.jsonb('analytics');
    builder.integer('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_analytic');
}
