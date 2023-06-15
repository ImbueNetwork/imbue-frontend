// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import config from "@/lib/config";

type ApiInfo = {
    imbueNetworkWebsockAddr: string | undefined;
    relayChainWebsockAddr: string | undefined;
    getstreamApiKey: string | undefined;
};

import nextConnect from "next-connect";

/**
 * @swagger
 * /api/info:
 *  get:
 *    description: Returns websocket addresses and stream api key
 *    responses:
 *      '200':
 *        description: imbue network ws address, relay chain ws address, stream api key
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                imbueNetworkWebsockAddr: 
 *                  type: string
 *                  description: Websocket address of imbue network node
 *                relayChainWebsockAddr:
 *                  type: string
 *                  description: websocket address of relay chain(kusama)
 *                getstreamApiKey:
 *                  type: string
 *                  description: GetStream API Key
 */

export default nextConnect().get(
    async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({
            imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
            relayChainWebsockAddr: config.relayChainWebsockAddr,
            getstreamApiKey: config.getstreamApiKey,
        });
    }
);
