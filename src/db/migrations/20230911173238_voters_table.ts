import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('project_votes', (table) => {
        table.increments('id', { primaryKey: true });
        table.integer('project_id');
        table.integer('milestone_index');
        table.integer('user_id');
        table.text('voter_address');
        table.boolean('vote');
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("project_votes");
}

