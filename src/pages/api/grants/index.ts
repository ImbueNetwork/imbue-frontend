import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

import { fetchAllGrants, Grant, insertGrant, paginatedData } from "@/lib/models";

import db from "@/db";

export default nextConnect().get(
    async (req: NextApiRequest, res: NextApiResponse) => {
        const data = req.query;

        await db.transaction(async (tx: any) => {
            try {
                await fetchAllGrants()(tx).then(async (grants: any) => {
                    const { currentData, totalItems } = paginatedData(
                        Number(data?.page || 1),
                        Number(data?.items_per_page || 5,
                        ), grants
                    );
                    res.status(200).json({
                        currentData,
                        totalItems
                    });
                });
            } catch (e) {
                new Error(`Failed to fetch all briefs`, { cause: e as Error })
            }
        });
    }
).post(async (req: NextApiRequest, res: NextApiResponse) => {
    const grant: Grant = req.body as Grant;

    await db.transaction(async (tx: any) => {
        try {
            const grant_id = await insertGrant(grant)(tx);
            res.status(200).json({ status: 'Success', grant_id });
        } catch (e) {
            throw new Error('Failed to insert a new grant.', { cause: e as Error });
        }
    });
});