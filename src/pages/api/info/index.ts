// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import config from '@/lib/config';

type ApiInfo = {
  imbueNetworkWebsockAddr: string | undefined;
  relayChainWebsockAddr: string | undefined;
  getstreamApiKey: string | undefined;
};

import nextConnect from 'next-connect';

export default nextConnect().get(
  async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({
      imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
      relayChainWebsockAddr: config.relayChainWebsockAddr,
      getstreamApiKey: config.getstreamApiKey,
      imageTag: config.imageTag,
      baseURL: config.baseURL,
    } as ApiInfo);
  }
);
