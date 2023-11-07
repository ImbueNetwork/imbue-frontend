import { Knex } from 'knex';

const table_freelancers = 'freelancers';
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_freelancers, (builder) => {
    builder.integer('hour_per_rate').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_freelancers, (builder) => {
    builder.dropColumn('hour_per_rate');
  });
}
