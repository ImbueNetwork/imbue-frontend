// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import db from "@/db";
import * as models from "../../models";
import { jwtOptions } from "../../auth/common";
// @ts-ignore
import * as passportJwt from "passport-jwt";
// @ts-ignore
import { fetchUser } from "../../models";
import passport from "passport";
import nextConnect from "next-connect";
const JwtStrategy = passportJwt.Strategy;

export const imbueStrategy = new JwtStrategy(jwtOptions, async function (
  jwt_payload: any,
  next: Function
) {
  const id = jwt_payload.id;
  try {
    db.transaction(async (tx) => {
      const user = await fetchUser(id)(tx);
      const web3Account = await models.fetchWeb3AccountByUserId(id)(tx);
      if (!user) {
        next(`No user found with id: ${id}`, false);
      } else {
        return next(null, {
          id: user.id,
          username: user.username,
          getstream_token: user.getstream_token,
          display_name: user.display_name,
          web3_address: web3Account?.address || null,
          profile_photo: user.profile_photo,
          country: user.country,
          region: user.region,
          about: user.about,
          website: user.website,
          industry: user.industry,
        });
      }
    });
  } catch (e) {
    return next(`Failed to deserialize user with id ${id}`, false);
  }
});

export const authenticate = (
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

passport.use(imbueStrategy);

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = await authenticate("jwt", req, res);
      res.status(200).send(user);
    } catch (error: any) {
      console.error(error);
      res.status(401).send(error.message);
    }
  });
