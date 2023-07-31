import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.decimal('amount', 12, 2).alter();
  });

  await knex.schema.alterTable('projects', (table) => {
    table.decimal('total_cost_without_fee', 12, 2).alter();
    table.decimal('imbue_fee', 12, 2).alter();
    table.decimal('required_funds', 12, 2).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('milestones', (table) => {
    table.decimal('amount', 8, 2).alter();
  });

  await knex.schema.alterTable('projects', (table) => {
    table.decimal('total_cost_without_fee', 10, 2).alter();
    table.decimal('imbue_fee', 10, 2).alter();
    table.decimal('required_funds', 10, 2).alter();
  });
}
