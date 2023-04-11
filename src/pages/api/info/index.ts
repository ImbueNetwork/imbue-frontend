// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import config from '../config'

type ApiInfo = {
    imbueNetworkWebsockAddr: string | undefined,
    relayChainWebsockAddr: string | undefined,
    getstreamApiKey: string | undefined,
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiInfo>
) {
    res.status(200).json({
        imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
        relayChainWebsockAddr: config.relayChainWebsockAddr,
        getstreamApiKey: config.getstreamApiKey
    })
}