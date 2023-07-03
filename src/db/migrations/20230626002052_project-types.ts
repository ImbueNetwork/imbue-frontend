import { Knex } from "knex";

import { auditFields } from "../utils";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('project_types', table => {
        table.increments('type', { primaryKey: true });
        table.string('description');
        auditFields(knex, table);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw('drop table project_types cascade');
}

