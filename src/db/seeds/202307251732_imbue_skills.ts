import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('imbue_skills').insert([
    { name: 'Substrate' },
    { name: 'Rust' },
    { name: 'Polkadot' },
    { name: 'Kusama' },
    { name: 'smart contracts' },
    { name: 'React' },
    { name: 'Typescript' },
    { name: 'Javascript' },
    { name: 'Go' },
    { name: 'Rust' },
    { name: 'Substrate' },
    { name: 'Solidity' },
    { name: 'Adobe Photoshop' },
    { name: 'Graphic Design' },
    { name: 'Wireframing' },
    { name: 'UI/UX Design' },
  ]);
}
