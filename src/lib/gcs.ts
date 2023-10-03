import { Storage } from '@google-cloud/storage';

const storage = new Storage(
//   {
//   keyFilename: './public/KEY_FILENAME.json',
// }
);

export const bucket = storage.bucket('imbue-staging');

export const createWriteStream = (filename: string) => {
  const ref = bucket.file(filename);

  const stream = ref.createWriteStream();

  return stream;
};
