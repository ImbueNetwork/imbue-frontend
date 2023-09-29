import { Response } from 'express';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';

import { createWriteStream } from './gcs';
import parseForm from './promisify';

export const method1 = async (
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | Response
) => {
  const form = formidable();

  const { files } = await parseForm(form, req);

  const file = files.file as any;

  createReadStream(file[0].filepath)
    .pipe(createWriteStream(file[0].originalFilename))
    .on('finish', () => {
      res
        .status(200)
        .json({
          url: `https://storage.cloud.google.com/test_sani/${file[0].originalFilename}`,
        });
    })
    .on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(err.message);
      res.status(500).json('File upload error: ' + err.message);
    });
};
