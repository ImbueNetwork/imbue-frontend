import type { Knex } from 'knex';

import { ON_UPDATE_TIMESTAMP_FUNCTION } from '../utils';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  const tableName = 'projects';
  await knex.schema.alterTable(tableName, (builder) => {
    builder.integer('duration_id').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const tableName = 'projects';
  await knex.schema.alterTable(tableName, (builder) => {
    builder.dropColumn('duration_id');
  });
}
