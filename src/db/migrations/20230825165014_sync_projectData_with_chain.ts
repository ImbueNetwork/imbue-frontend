import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('projects', (table) => {
    table.integer('first_pending_milestone').defaultTo(0);
    table.boolean('project_in_milestone_voting').defaultTo(false);
    table.boolean('project_in_voting_of_no_confidence').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('projects', (table) => {
        table.dropColumn('first_pending_milestone');
        table.dropColumn('project_in_milestone_voting');
        table.dropColumn('project_in_voting_of_no_confidence');
      });
}
