import next, { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import db from "../../../db";
import * as models from "../../../models";
import { fetchWeb3AccountByAddress } from "../../../models";
import { jwtOptions } from "../../common";
import { signatureVerify } from "@polkadot/util-crypto";

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

              console.log("**** solution is ");
              console.log(solution);

              console.log("**** web3Account is ");
              console.log(web3Account);

              console.log("**** user is ");
              console.log(user);

              console.log("**** signature verify is ");
              // const test = signatureVerify(web3Account.challenge, solution.signature, solution.address);
              // console.log("****** is");
              // console.log(test);

              if (signatureVerify(web3Account.challenge, solution.signature, solution.address).isValid) {
                const payload = { id: user?.id };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);

                res.setHeader('Set-Cookie', serialize('access_token', token, {
                  secure: config.environment !== "development",
                  httpOnly: true
              }));

                res.send({ success: true });
              } else {
                const challenge = uuid();
                const [web3Account, _] = await models.upsertWeb3Challenge(
                  user,
                  solution.address,
                  solution.type,
                  challenge
                )(tx);

                /**
                 * FIXME: this sets the "WWW-Authenticate" header.
                 * Should we be running all of the auth calls
                 * through the same endpoint and responding with
                 * the "challenge" here, instead? Also, what form
                 * should this actually take?
                 */
                next(`Imbue ${web3Account.challenge}`);
              }
            } else {
              res.status(404);
            }
          }
        } catch (e) {
          await tx.rollback();
          next(new Error(
            `Unable to finalise login`,
            { cause: e as Error }
          ));
        }
      });
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}


