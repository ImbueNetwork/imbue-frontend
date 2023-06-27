import { Knex } from 'knex';

const table_freelancers = 'freelancers';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_freelancers, (builder) => {
    builder.boolean('verified').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(table_freelancers, (builder) => {
    builder.dropColumn('verified');
  });
}
