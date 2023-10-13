import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.text('last_notification_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    'ALTER TABLE users DROP COLUMN IF EXISTS last_notification_id'
  );
}
