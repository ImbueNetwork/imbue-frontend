import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from "uuid";
import nextConnect from 'next-connect'
import db from "../../../db";
import * as models from "../../../models";
import { fetchWeb3AccountByAddress } from "../../../models";
import { ensureParams, jwtOptions, verifyUserIdFromJwt } from "../../common";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from '@polkadot/util';

import jwt from 'jsonwebtoken';
import config from "../../../config"
import { serialize } from 'cookie';
import next from 'next';


export default nextConnect()
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query, method } = req
        ensureParams(req.body.account, next, ["address", "meta", "type"]);
        ensureParams(req.body.account.meta, next, ["name", "source"]);
        const account = req.body.account;
        const existingUser = req.body.existing_user;
        const address = account.address.trim();
        if (existingUser) {
            // verifyUserIdFromJwt(req, res, next, existingUser.id);
            db.transaction(async tx => {
                const challenge = uuid();
                const [web3Account, isInsert] = await models.updateOrInsertUserWeb3Address(
                    existingUser, address, account.type, challenge
                )(tx);
                res.send({ existingUser, web3Account });
            });
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
            // If no address can be found, create a `users` and then a
            // `federated_credential`
            models.getOrCreateFederatedUser(
                account.meta.source,
                address,
                account.meta.name,
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
                            const challenge = uuid();
                            const [web3Account, isInsert] = await models.upsertWeb3Challenge(
                                user, address, account.type, challenge
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
    });
