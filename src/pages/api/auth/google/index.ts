import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect'
import db from "../../db";
import * as models from "../../models";
import { fetchUserOrEmail, fetchWeb3AccountByAddress, updateFederatedLoginUser } from "../../models";
import { jwtOptions } from "../common";
import jwt from 'jsonwebtoken';
import { setTokenCookie } from "@/pages/api/auth-cookies";
export default nextConnect()
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const creds = req.body;
        db.transaction(async tx => {
            const userInfo: any = jwt.decode(creds.credential);
            if (!userInfo) {
                res.status(404);
            } else {
                console.log(userInfo);
                const email = userInfo.email;
                const username = email.replaceAll('.', '');
                const displayname = userInfo.name;
                const issuer = userInfo.iss;
                const usernameExists = await fetchUserOrEmail(username)(tx);
                if (usernameExists?.id) {
                    const payload = { id: usernameExists?.id };
                    const token = await jwt.sign(payload, jwtOptions.secretOrKey);
                    await setTokenCookie(res, token);
                    res.send({ success: true });
                } else {
                    try {
                        models.getOrCreateFederatedUser(
                            issuer,
                            username,
                            displayname,
                            async (err: Error, user: models.User) => {
                                if (err) {
                                    new Error(
                                        `Failed to upsert federated authentication. ${err}`
                                    )
                                }
                                if (!user) {
                                    res.status(404).end(`No user provided`)
                                }
                                db.transaction(async tx => {
                                    await updateFederatedLoginUser(
                                        user, username, email
                                    )(tx);
                                    const payload = { id: user.id };
                                    const token = await jwt.sign(payload, jwtOptions.secretOrKey);
                                    await setTokenCookie(res, token);
                                    res.send({ id: user.id, display_name: user.display_name });
                                });
                            }
                        );
                    } catch (e) {
                        tx.rollback();
                        res.status(500).end(`Unable to upsert details for user: ${username}`)
                    }
                }
            }
        });
    });
