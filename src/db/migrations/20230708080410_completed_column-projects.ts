import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('projects', (table) => {
        table.boolean('completed');
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('projects', (builder) => {
        builder.dropColumn('completed');
      });
}

