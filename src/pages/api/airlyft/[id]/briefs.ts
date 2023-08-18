import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';

export default nextConnect().get(
    async (req: NextApiRequest, res: NextApiResponse) => {
        const { query } = req;

        const web3_address = query.id;

        db.transaction(async (tx) => {
            try {

                const user: User = (
                    await models.fetchUserWithUsernameOrAddress(
                        web3_address
                    )(tx)
                )[0] as User;


                const briefApplications = await models.fetchUserBriefs(user.id)(tx);

                res.status(200).json(briefApplications.length > 0);
            } catch (e) {
                res.status(200).json(false);

            }
        });
    }
);
