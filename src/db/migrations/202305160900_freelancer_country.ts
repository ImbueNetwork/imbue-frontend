import { Knex } from 'knex';

import { auditFields, onUpdateTrigger } from '../utils';

export async function up(knex: Knex): Promise<void> {
  const tableName = 'freelancer_country';
  await knex.schema
    .createTable(tableName, (builder) => {
      builder.increments('id', { primaryKey: true });
      builder.string('country');
      builder.string('region');

      builder.integer('freelancer_id');
      builder.foreign('freelancer_id').references('freelancers.id');

      builder.integer('user_id');
      builder.foreign('user_id').references('users.id');

      auditFields(knex, builder);
    })
    .then(onUpdateTrigger(knex, tableName));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('freelancer_country');
}
