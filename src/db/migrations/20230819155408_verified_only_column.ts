import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('briefs', (table) => {
    table.boolean('verified_only').defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('briefs', (builder) => {
    builder.dropColumn('verified_only');
  });
}
