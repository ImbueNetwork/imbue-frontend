import { Knex } from 'knex';

import { auditFields } from '../utils';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('imbue_skills', (table) => {
    table.increments('id', { primaryKey: true });
    table.text('name').notNullable();
    auditFields(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop table imbue_skills cascade');
}
