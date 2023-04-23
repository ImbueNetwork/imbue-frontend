import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect'
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from '@polkadot/util';

import db from "../../../db";
import * as models from "../../../models";
import { fetchWeb3AccountByAddress } from "../../../models";
import { jwtOptions } from "../../common";
import { signatureVerify } from "@polkadot/util-crypto";

type Solution = {
  signature: string;
  challenge: string;
  account: any;
};

import jwt from 'jsonwebtoken';
import config from "../../../config"
import { serialize } from 'cookie';
import { setTokenCookie } from "@/pages/api/auth-cookies";
import { WalletAccount } from "@talismn/connect-wallets";


export default nextConnect()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async tx => {
      try {
        const solution: Solution = req.body;
        const account = solution.account;
        const address = solution.account.address;
        const web3Account = await fetchWeb3AccountByAddress(
          address
        )(tx);

        if (!web3Account) {
          res.status(404);
        } else {
          const existingUser = await models.fetchUser(web3Account.user_id)(tx);
          if (existingUser?.id) {
            if (signatureVerify(solution.challenge, solution.signature, address).isValid) {
              const payload = { id: existingUser?.id };
              const token = jwt.sign(payload, jwtOptions.secretOrKey);
              setTokenCookie(res, token);
              res.send({ success: true });
            } else {
              res.status(404);
            }
          } else {
            try {
              encodeAddress(
                isHex(address)
                  ? hexToU8a(address)
                  : decodeAddress(address)
              );
            } catch (e: any) {
              res.status(400).end(`Invalid address param. ${(e as Error).message}`)
            }
            models.getOrCreateFederatedUser(
              account.source,
              address,
              account.name!,
              async (err: Error, user: models.User) => {
                if (err) {
                  res.status(500).end(`Error: ${err.message}`)
                }
                if (!user) {
                  res.status(404).end(`No user provided`)
                }
                // create a `challenge` uuid and insert it into the users
                // table respond with the challenge
                db.transaction(async tx => {
                  try {
                    const [web3Account, isInsert] = await models.upsertWeb3Challenge(
                      user, address, account.type!, solution.challenge
                    )(tx);

                    if (isInsert) {
                      res.status(201);
                    }
                    res.send({ user, web3Account });
                  } catch (e) {
                    await tx.rollback();
                    res.status(500).end(`Unable to upsert web3 challenge for address: ${address}`,)
                  }
                });
              }
            );


          }
        }
      } catch (e) {
        await tx.rollback();
        res.status(500).end(`Unable to finalise login.`,)
      }
    });
  });
