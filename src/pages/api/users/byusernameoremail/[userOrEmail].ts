// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect';
import passport from 'passport';
import db from '@/db';
import { User } from '@/model';
import * as models from "../../models";

export default nextConnect()
    .use(passport.initialize())
    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        const { userOrEmail } = req.query;

        if (userOrEmail === undefined) return res.status(401).send({ error: "Username of Email not found" })
        let response
        await db.transaction(async tx => {
            try {
                const user: User = await models.fetchUserOrEmail(userOrEmail.toString())(tx) as User;
                if (user) {
                    response = { id: user.id, display_name: user.display_name, username: user.username };
                }
            } catch (e) {
                new Error(
                    `Failed to fetch user ${userOrEmail}`,
                    { cause: e as Error }
                );
            }
        });
        res.status(201).send(response)
    })