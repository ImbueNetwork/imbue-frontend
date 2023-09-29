import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: 'KEY_FILENAME.json',
});

export const bucket = storage.bucket('test_sani');

export const createWriteStream = (filename: string, contentType?: string) => {
  const ref = bucket.file(filename);

  const stream = ref.createWriteStream({
    gzip: true,
    contentType: contentType,
  });

  return stream;
};

