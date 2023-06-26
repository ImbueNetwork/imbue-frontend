import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    knex.schema.createTable('project_types', table => {
        table.increments('type', { primaryKey: true });
        table.string('description');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw('drop table project_types cascade');
}

