import next, { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import db from "../../../db";
import * as models from "../../../models";
import { fetchWeb3AccountByAddress } from "../../../models";
import { jwtOptions } from "../../common";
import { signatureVerify } from "@polkadot/util-crypto";
import { v4 as uuid } from "uuid";

type Solution = {
  signature: string;
  address: string;
  type: string;
};

import jwt from 'jsonwebtoken';
import config from "../../../config"
import { serialize } from 'cookie';


export default async function authHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { query, method } = req
  switch (method) {
    case 'POST':

      db.transaction(async tx => {
        try {
          const solution: Solution = req.body;
          const web3Account = await fetchWeb3AccountByAddress(
            solution.address
          )(tx);

          if (!web3Account) {
            res.status(404);
          } else {
            const user = await models.fetchUser(web3Account.user_id)(tx);

            if (user?.id) {
              if (signatureVerify(web3Account.challenge, solution.signature, solution.address).isValid) {
                const payload = { id: user?.id };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);

                res.setHeader('Set-Cookie', serialize('access_token', token, {
                  secure: config.environment !== "development",
                  path: '/',
                  httpOnly: true
                }));

                res.send({ success: true });
              }
            } else {
              res.status(404);
            }
          }
        } catch (e) {
          await tx.rollback();
          res.status(500).end(`Unable to finalise login.`,)
        }
      });
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}


