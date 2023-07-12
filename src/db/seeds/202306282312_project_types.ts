import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    await knex('project_types').insert([
        { type: 0, description: 'briefs' },
        { type: 1, description: 'grants' },
    ]);

}
