
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { initWasm } from '@trustwallet/wallet-core';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { getCoinType } from '@/utils/evm';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;

export const generateAddress = async (projectId: number, targetCurrency: string) => {
  const core = await initWasm();
  const {  HDWallet, AnyAddress } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(targetCurrency);
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const fromAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
  return fromAddress.description();
};

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = Number(id);
    if (!projectId || !WALLET_MNEMONIC) {
      return res.status(404);
    }
    const targetCurrency = "usdt";
    const address = await generateAddress(projectId, targetCurrency);
    return res.status(200).json(address);
  });