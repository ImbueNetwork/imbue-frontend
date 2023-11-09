import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('no_confidence_voters', (builder) => {
    builder.dropColumns('username', 'display_name', 'profile_photo');
    builder.boolean('vote').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('no_confidence_voters', (builder) => {
    builder.text('username');
    builder.text('display_name');
    builder.text('profile_photo');
  });

  const exists = await knex.schema.hasColumn('no_confidence_voters', 'vote');

  if (!exists)
    await knex.schema.alterTable('no_confidence_voters', (builder) => {
      builder.boolean('vote');
    });
}
