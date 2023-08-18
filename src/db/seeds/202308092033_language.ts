import parser from 'csv-parser';
import fs from 'fs';
import { Knex } from 'knex';
import path from 'path';
const pathtofile = path.join(__dirname, '../../assets/language.csv');

type language = {
  name: string;
};

const result: language[] = [];

fs.createReadStream(pathtofile)
  .pipe(parser({}))
  .on('data', (data: language) => result.push(data));

export async function seed(knex: Knex): Promise<void> {
  await knex('languages').insert(result);
}
