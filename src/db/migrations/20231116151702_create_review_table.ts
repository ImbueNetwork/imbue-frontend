import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reviews', (builder) => {
    builder.increments('id', { primaryKey: true });
    builder.timestamps(true, true);
    builder.integer('freelancer_id');
    builder.integer('ratings');
    builder.text('title');
    builder.text('description');
    builder.integer('user_id');
    builder.foreign('user_id').references('users.id');
    builder.foreign('freelancer_id').references('freelancers.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reviews');
}
