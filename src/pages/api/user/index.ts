import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";

const authenticate = (
  method: string,
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      { session: false },
      (error: Error, token: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    )(req, res);
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await authenticate("jwt", req, res);
  console.log({ user });
  res.status(200).send(user);
}
