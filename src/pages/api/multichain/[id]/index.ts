/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';
import { initWasm, TW, KeyStore } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;

export const generateAddress = async (projectId: number, targetCurrency: string) => {
  const core = await initWasm();
  const { CoinType, HDWallet, AnyAddress } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!,"");
  const coinTypeLookup: Record<string, CoinType> = {
    "evm": CoinType.ethereum,
    "atom": CoinType.cosmos,
    "solana": CoinType.solana,
    "polygon": CoinType.polygon,
    "polkadot": CoinType.polkadot,
  };

  const coinType = coinTypeLookup[targetCurrency.toLowerCase()];
  const key = wallet.getDerivedKey(coinType,projectId,0,projectId);
  const pubKey = key.getPublicKey(coinType);
  const address = AnyAddress.createWithPublicKey(pubKey, coinType);
  return address.description();
};

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const {id} = req.query;
    const projectId = Number(id);
    if(!projectId) {
      return res.status(404);
    }
    const targetCurrency = "polygon";
    const address = await generateAddress(projectId,targetCurrency);
    return res.status(200).json(address);
  });