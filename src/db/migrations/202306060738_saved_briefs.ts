import { Knex } from 'knex';

import { auditFields } from '../utils';

export async function up(knex: Knex): Promise<void> {
  const tableName = 'saved_briefs';
  await knex.schema.createTable(tableName, (builder) => {
    builder.increments('id', { primaryKey: true });
    builder.integer('brief_id');

    builder.integer('user_id');

    auditFields(knex, builder);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop table saved_briefs cascade');
}
