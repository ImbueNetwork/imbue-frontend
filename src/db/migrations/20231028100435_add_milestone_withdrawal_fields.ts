import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.boolean('withdrawn');
    table.string('withdrawn_transaction_hash').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const tableName = 'milestones';
  await knex.schema.alterTable(tableName, (builder) => {
    builder.dropColumn('withdrawn');
    builder.dropColumn('withdrawn_transaction_hash');
  });
}
