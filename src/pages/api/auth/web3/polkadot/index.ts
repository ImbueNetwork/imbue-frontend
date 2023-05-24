import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect'
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from '@polkadot/util';

import db from "@/db";
import * as models from "../../../models";
import { fetchWeb3AccountByAddress, User } from "../../../models";
import { jwtOptions, verifyUserIdFromJwt } from "../../common";
import { signatureVerify } from "@polkadot/util-crypto";

type Solution = {
  signature: string;
  challenge: string;
  account: any;
  logged_in_user: User;
};

import jwt from 'jsonwebtoken';
import config from "../../../config"
import { serialize } from 'cookie';
import { setTokenCookie } from "@/pages/api/auth-cookies";
import { WalletAccount } from "@talismn/connect-wallets";
import next from 'next';


export default nextConnect()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    db.transaction(async tx => {
      try {
        const solution: Solution = req.body;
        const account = solution.account;
        const address = solution.account.address;
        const validSignature = signatureVerify(solution.challenge, solution.signature, address).isValid;
        if (!validSignature) {
          return res.status(403);
        }
        const loggedInUser = req.body.logged_in_user;
        if (loggedInUser) {
          verifyUserIdFromJwt(req, res, loggedInUser.id);
          db.transaction(async tx => {
            const [web3Account, isInsert] = await models.updateOrInsertUserWeb3Address(
              loggedInUser, address, account.type, solution.challenge
            )(tx);
            return res.send({ existingUser: loggedInUser, web3Account });
          });
        } else {
          const userExists = await fetchWeb3AccountByAddress(
            address
          )(tx);

          if (userExists) {
            const payload = { id: userExists?.user_id };
            const token = await jwt.sign(payload, jwtOptions.secretOrKey);
            await setTokenCookie(res, token);
            return res.send({ success: true });
          }

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


      } catch (e) {
        await tx.rollback();
        res.status(500).end(`Unable to finalise login.`,)
      }
    });
  });
