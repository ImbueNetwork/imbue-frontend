import parser from 'csv-parser';
import fs from 'fs';
import { Knex } from 'knex';
import path from 'path';
const pathtofile = path.join(__dirname, '../../assets/all_skills.csv');

type skills = {
  name: string;
};

const result: skills[] = [];

fs.createReadStream(pathtofile)
  .pipe(parser({}))
  .on('data', (data:skills) => result.push(data));

export async function seed(knex: Knex): Promise<void> {
  await knex('imbue_skills').insert(result);
}
