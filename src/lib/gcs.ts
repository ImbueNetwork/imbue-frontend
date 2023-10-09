import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: './public/KEY_FILENAME.json',
});
//   {
//   keyFilename: './public/KEY_FILENAME.json',
// }

export const bucket = storage.bucket(`${process.env.BUCKET_NAME}`);

export const createWriteStream = (filename: string) => {
  const ref = bucket.file(filename);

  const stream = ref.createWriteStream();

  return stream;
};
