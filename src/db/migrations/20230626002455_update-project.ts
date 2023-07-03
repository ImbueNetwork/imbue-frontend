import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    knex.schema.table('projects', table => {
        table.integer('project_type');
        table
            .foreign('project_type')
            .references('project_types.id')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    knex.schema.table('projects', table => {
        table.dropColumn('project_type');
    });
}

