import type { Knex } from 'knex';

import { ON_UPDATE_TIMESTAMP_FUNCTION } from '../utils';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  const usersTableName = 'projects';
  await knex.schema.alterTable(usersTableName, (builder) => {
    // username must be unique.
    builder.integer('duration_id').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const usersTableName = 'users';
  await knex.schema.alterTable(usersTableName, (builder) => {
    builder.dropColumn('username');
    builder.dropColumn('email');
    builder.dropColumn('password');
  });
}
