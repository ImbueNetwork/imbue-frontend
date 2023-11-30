import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('reviews', (builder) => {
    builder.dropColumn('freelancer_id');
    builder.integer('reviewer_id');
    builder.integer('project_id');
    builder.foreign('reviewer_id').references('users.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('reviews', (builder) => {
    builder.integer('freelancer_id');
    builder.foreign('freelancer_id').references('users.id');
    builder.dropColumn('reviewer_id');
    builder.dropColumn('project_id');
  });
}
