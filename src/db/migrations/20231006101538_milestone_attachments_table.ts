import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('milestone_attachments', (table) => {
        table.increments('id', { primaryKey: true });
        table.integer('project_id');
        table.integer('milestone_index');
        table.integer('user_id');
        table.text('fileURL');
      });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("milestone_attachments");
}

