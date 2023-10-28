
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { initWasm } from '@trustwallet/wallet-core';
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';
import { Provider } from 'react-redux';

import { fetchProjectById, fetchProjectMilestones } from '@/lib/models';
import { getCoinType } from '@/utils/evm';

import db from '@/db';
import { Currency } from '@/model';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;

export const getBalance = async (projectId: number, targetCurrency: string) => {
  const core = await initWasm();
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const { HDWallet, AnyAddress } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(targetCurrency);
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
  const projectBalance = await provider.getBalance(projectAddress.description());
  return projectBalance;
};

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    let project;
    let projectBalance;
    const projectId = Number(id);
    if (!projectId || !WALLET_MNEMONIC) {
      return res.status(404);
    }
    await db.transaction(async (tx: any) => {
      try {
        project = await fetchProjectById(Number(projectId))(tx);

        if (!project || !WALLET_MNEMONIC) {
          return res.status(404).end();
        }

        const targetCurrency = Currency[project?.currency_id];
        projectBalance = await getBalance(projectId, targetCurrency);

        return res.status(200).json(Number(projectBalance));
      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to retreive balance project id ${id}. Cause ${e}`,
        });
      }
    });


  });