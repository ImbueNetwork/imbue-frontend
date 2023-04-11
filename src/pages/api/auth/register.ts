
import next, { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect'
import db from "../db";
import { updateFederatedLoginUser, getOrCreateFederatedUser, fetchUserOrEmail, User } from "../models";
import { ensureParams, jwtOptions } from "./common";
import jwt from 'jsonwebtoken';
import config from "../config";
import { serialize } from 'cookie';

export default nextConnect()
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const {
            username,
            email,
            password
        } = req.body;
        ensureParams(req.body, next, ["username", "email", "password"]);
        db.transaction(async tx => {
            const usernameExists = await fetchUserOrEmail(username)(tx);
            const emailExists = await fetchUserOrEmail(email)(tx);
            if (usernameExists) {
                return res.status(409).send(JSON.stringify('Username already exists.'));
            } else if (emailExists) {
                return res.status(409).send(JSON.stringify('Email already exists.'));
            } else {
                let updateUserDetails = async (err: Error, user: User) => {
                    if (err) {
                        res.status(500).end(`Error. ${err.message}`)
                    }
                    if (!user) {
                        res.status(404).end(`No user found.`)
                    }
                    db.transaction(async tx => {
                        try {
                            await updateFederatedLoginUser(
                                user, username, email, password
                            )(tx);
                            const payload = { id: user.id };
                            const token = jwt.sign(payload, jwtOptions.secretOrKey);

                            res.setHeader('Set-Cookie', serialize('access_token', token, {
                                secure: config.environment !== "development",
                                path: '/',
                                httpOnly: true
                            }));

                            res.send({ id: user.id, display_name: user.display_name });
                        } catch (e) {
                            tx.rollback();
                            res.status(500).end(`Unable to upsert details for user: ${username}`)
                        }
                    });
                };
    
                getOrCreateFederatedUser(
                    "Imbue Network",
                    username.toLowerCase(),
                    username.toLowerCase(),
                    updateUserDetails);
            }
        });
    });

