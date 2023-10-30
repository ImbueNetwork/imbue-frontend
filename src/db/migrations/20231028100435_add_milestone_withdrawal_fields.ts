import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.boolean('withdrawn');
    table.string('withdrawal_transaction_hash').nullable();
    table.string('imbue_fee_transaction_hash').nullable();
  });
  await knex.schema.alterTable('projects', (table) => {
    table.string('payment_address').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const tableName = 'milestones';
  await knex.schema.alterTable(tableName, (builder) => {
    builder.dropColumn('withdrawn');
    builder.dropColumn('withdrawal_transaction_hash');
    builder.dropColumn('imbue_fee_transaction_hash');
  });
  await knex.schema.alterTable('projects', (builder) => {
    builder.dropColumn('payment_address');
  });
}