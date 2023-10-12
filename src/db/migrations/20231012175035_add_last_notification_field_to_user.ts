import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.alterTable('users', (table) => {
    table.string('last_notification_id', 128);
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.alterTable('users', (table) => {
    table.dropColumn('last_notification_id');
  });
}
