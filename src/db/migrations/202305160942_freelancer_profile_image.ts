import { Knex } from 'knex';

import { auditFields, onUpdateTrigger } from '../utils';

export async function up(knex: Knex): Promise<void> {
  const tableName = 'freelancer_profile_image';
  await knex.schema
    .createTable(tableName, (builder) => {
      builder.increments('id', { primaryKey: true });
      builder.string('profile_image');

      builder.integer('freelancer_id');
      builder.foreign('freelancer_id').references('freelancers.id');

      builder.integer('user_id');
      builder.foreign('user_id').references('users.id');

      auditFields(knex, builder);
    })
    .then(onUpdateTrigger(knex, tableName));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('freelancer_profile_image');
}
