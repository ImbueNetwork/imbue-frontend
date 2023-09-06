import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('no_confidence_voters', (table) => {
    table.increments('id', { primaryKey: true });
    table.integer('project_id');
    table.integer('user_id');
    table.text('username');
    table.text('display_name');
    table.text('profile_photo');
    table.text('web3_address');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('no_confidence_voters');
}
