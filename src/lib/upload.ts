import formidable from 'formidable';
import { createReadStream } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import * as models from '@/lib/models';

import { authenticate, verifyUserIdFromJwt } from '@/pages/api/auth/common';

import { createWriteStream } from './gcs';
import parseForm from './promisify';

export const method1 = async (req: NextApiRequest, res: NextApiResponse) => {
  const userAuth: Partial<models.User> | any = await authenticate(
    'jwt',
    req,
    res
  );

  verifyUserIdFromJwt(req, res, [userAuth.id]);

  const form = formidable();
  const { files } = await parseForm(form, req);
  const fileList = files.files as any;

  const promises: Promise<any>[] = [];

  fileList.forEach((file: any) => {
    const fileName =
      userAuth.username + Date.now() + '$' + file.originalFilename;

    const promise = new Promise<any>((resolve, reject) => {
      createReadStream(file.filepath)
        .pipe(createWriteStream(fileName))
        .on('finish', () => {
          resolve(
            `https://storage.cloud.google.com/${process.env.BUCKET_NAME}/${fileName}`
          );
        })
        .on('error', (err) => {
          reject('File upload error: ' + err.message);
        });
    });

    promises.push(promise);
  });

  try {
    const resp = await Promise.all(promises);
    return res.status(200).json({ url: resp });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json('File upload error: ' + error);
  }
};
