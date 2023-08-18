import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import * as models from '@/lib/models';

import db from '@/db';


export default nextConnect().get(
    async (req: NextApiRequest, res: NextApiResponse) => {
        const { query } = req;

        const web3_address = query.id;

        if (!web3_address) {
            return res.status(200).json(false);
        }

        db.transaction(async (tx) => {
            try {

                const user = await models.fetchUserWithUsernameOrAddress(
                    web3_address.toString()
                )(tx);

                if (!user) {
                    return res.status(200).json(false);

                }

                const briefApplications = await models.fetchUserBriefs(user.id)(tx);

                return res.status(200).json(briefApplications.length > 0);
            } catch (e) {
                return res.status(200).json(false);

            }
        });
    }
);
