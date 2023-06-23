import { Knex } from "knex";

import { auditFields } from "../utils";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('project_approvers', (table) => {
        table.increments('id');
        table.integer('project_id');
        table.foreign('project_id').references('projects.id');
        table.string('approver');
        auditFields(knex, table);
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw('drop table project_approvers cascade');
}

