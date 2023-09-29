import type { NextApiRequest, NextApiResponse } from 'next';

import { method1 } from '@/lib/upload';

// import { method1 } from "../../lib/";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.status(400).send(`Invalid method: ${req.method}`);
        return;
    }

    method1(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const storage = new Storage({
//     projectId: 'chromatic-tree-400416',
//     credentials: {
//       client_email: 'sani-226@chromatic-tree-400416.iam.gserviceaccount.com',
//       private_key:
//         '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQClFtjqYkd987Ki\n0ztPOqyQqdnT2MChtQdBdXsoIeX0+14CKpGEvDAtd2SDLp/VJAd1juPcMj9T3AEb\nOKvimjok1ni1fAG2j8MtUBq063H9yyABKTpq+CnKkUbh4yshjGMM0HBUiXvFBvp1\nDRCfPBSUGwK1iiwNlcURrjHse/o8pB12VXBiQTOLfF8ir/5mt12ZRt2eIOxbF6jC\nRpjfIzhdv/zSFs3MA5NC5HMaRdLxHa+WODpgxy9algT/+W2RqG39tXjptPFPmbPX\npOEsqBiyceB8KY0ihp98fhBwdRr9WqzpL7KJ6XmCkg+tT/DAVafVgiflwFHZiZVC\nyzyWHb01AgMBAAECggEADVaxvbT6ysdDF9snpR38Aw+TgoWLrDpzX3YYYSSQBGxq\nQD7j6rdxJb30+JEZUpV/0XSd83951L2SDKWBDyTf7XReD2fOvvXm/VpwtffPX4P8\neNY1xUkkyJxWqk9PqlJspFnpDDje2mCsdthQj1UW4o/mIaM22P17YpN9BCWmO8+e\nF7e9BtUG403ITEVSBcpasaOsfokiTmFeavRS444D3N9cHWisrEZGIH3PRdcmwW4C\n/b74WiD0TQqYqmA09/jAWNJXfNjaqaB4img4xrQbVBuhUN6aJ4Fr9MQszeC1aTb8\nYprTNGT+M442n0GWZ/rhafiN4OVHAZiCjUwk2OrCVwKBgQDhQmVNhaHVUM6Ya+6M\nCfCMJVk5q3JmOkwbH8Tq+4mc5oawDVkxtZiPL9wIblvfCOhIuFU82xQKxYRt15Db\nwbk1ZlLohPMFohK22R8yvU497oKCfM9pZB/Mv2m6U9AmrWDWhB7Ts8gRpt5Fqk8a\nBXO47iMY4CZleKmCwBnHTHGVxwKBgQC7nl0e0D5NirtElH8utHVAT3tYFUA/ER9g\n+s6OkyYe7IIqem1Nl6AOZDV2XS+lm1mJRMCvIe5csCGdfhVuGaCUODTzZaKoCvD+\nrRY6HC96TgVsuAWGY3WN8PTV52QA8UVp3Jt2odfDF8CLOldap6Siucx5ECpWaENs\nmLBvloulIwKBgByqamHXI6UVx3S2J4FCso3jItun6cMAoDbDcDfHEtgYrgMxb6xX\nw7ZVDNc11BMp+wVmD9LSvlYwlI215QVSPdOB1gMpCBQrb948+y9lz9Mpywn4AB0V\nVMalhTrk95Q0dCJYZePi+Q7mAVs0NSTGlNdv1p+PxtMa69drwtwN6lZ5AoGAcT2Q\nbvy53guSJD6M1R/OdVaD2BJbiLVI/zviWGOwapHNrt3eAys1S/pn2l08WPR/Aj8h\nHZOZTxBv+aMURDPrnAqgyxfZKRwRgWXvOHuynFtjIs+fZhG57kY1QLY8weTeRJsG\nqn/cvsAjUuWPvAPbduw14gxDwYuExpMSSwfOmYkCgYEAggpsmayyC+fJpqmC7JWi\nEngccOTWxm2QvQDYPNHlThx+YA9CiQVuQ4DFbPXUXwuAL6evUt9hY3KETf7hOx3Q\no5s1fzbSWRklUP4U/3cHUmi4uzLu1lN99RM8bPQ3QxgRKrolCEs5DcozZliOLBAY\nhQoV9qJnYzFVu2ivqlpFwAc=\n-----END PRIVATE KEY-----\n',
//     },
//   });

//   const data = await req.formData()
//   console.log("🚀 ~ file: upload.ts:39 ~ data:", data)
//   const file: File | null = data.get('file') as unknown as File

//   if (!file) {
//     return NextResponse.json({ success: false })
//   }

//   const bytes = await file.arrayBuffer()
//   const buffer = Buffer.from(bytes)

//   const bucket = storage.bucket('test_sani');
//   const bucketFile = bucket.file(req.query.file as string);
  
//   createReadStream('/Users/stephen/Photos/birthday-at-the-zoo/panda.jpg')
//   .pipe(bucketFile.createWriteStream({
//     metadata: {
//       contentType: 'image/jpeg',
//       metadata: {
//         custom: 'metadata'
//       }
//     }
//   }))
//   .on('error', function(err) {})
//   .on('finish', function() {
//     // The file upload is complete.
//   });

//   res.status(200).json(response);
// }
