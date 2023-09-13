import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const columns = await knex('freelancers').select('bio', 'user_id');

  if (columns.length) {
    const promises: Promise<any>[] = [];
    columns.forEach((freelancer) => {
      const promise = knex('users')
        .update({ about: freelancer.bio })
        .where({ id: freelancer.user_id });

      promises.push(promise);
    });

    await Promise.all(promises);
  }
}

export async function down(knex: Knex): Promise<void> {
  const columns = await knex('freelancers').select('bio', 'user_id');

  if (columns.length) {
    const promises: Promise<any>[] = [];
    columns.forEach((freelancer) => {
      const promise = knex('users')
        .update({ about: freelancer.bio })
        .where({ id: freelancer.user_id });

      promises.push(promise);
    });

    await Promise.all(promises);
  }
}
