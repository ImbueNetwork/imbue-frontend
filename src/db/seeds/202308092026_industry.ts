import parser from 'csv-parser';
import fs from 'fs';
import { Knex } from 'knex';
import path from 'path';
const pathtofile = path.join(__dirname, '../../assets/industry.csv');

type industry = {
  name: string;
};

const result: industry[] = [];

fs.createReadStream(pathtofile)
  .pipe(parser({}))
  .on('data', (data: industry) => result.push(data));

export async function seed(knex: Knex): Promise<void> {
  await knex('industries').insert(result);
}
