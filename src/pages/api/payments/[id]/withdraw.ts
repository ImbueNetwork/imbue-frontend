
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { initWasm } from '@trustwallet/wallet-core';
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import { fetchProjectById, fetchProjectMilestones } from '@/lib/models';
import { getEVMContract } from '@/utils/evm';

import db from '@/db';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;

export const transfer = async (projectId: number, currency: string, destinationAddress:string, amount: number) => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const core = await initWasm();
  const { CoinType, HDWallet, HexCoding } = core;
  if(!WALLET_MNEMONIC) {
    return new Error(`Wallet Mnemonic not populated`);
  }

  const CURRENCY_COINTYPE_LOOKUP: Record<string, any> = {
    "eth": CoinType.ethereum,
    "usdt": CoinType.ethereum,
    "atom": CoinType.cosmos,
    "sol": CoinType.solana,
    "matic": CoinType.polygon,
    "dot": CoinType.polkadot,
  };
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC, "");
  const coinType = CURRENCY_COINTYPE_LOOKUP[currency];
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const privateKeyHex = HexCoding.encode(key.data());
  const sender = new ethers.Wallet(privateKeyHex, provider);
  let tx: any;
  switch (currency.toLowerCase()) {
    case "eth":
      tx = await sender.sendTransaction({ to: destinationAddress, value: ethers.parseEther(amount.toString()) });
      break;
    case "usdt": {
      const contract = await getEVMContract(currency);
      const transferABI = [
        {
          name: "transfer",
          type: "function",
          inputs: [
            {
              name: "_to",
              type: "address",
            },
            {
              type: "uint256",
              name: "_tokens",
            },
          ],
          constant: false,
          outputs: [],
          payable: false,
        },
      ];

      const signer = await provider.getSigner();
      const token = new ethers.Contract(contract.address, transferABI, signer);
      const transferAmount = ethers.parseUnits(amount.toString(), contract.decimals);
      await token
        .transfer(destinationAddress, transferAmount)
        .then(async (transferResult: any) => {
          tx = await transferResult;
        })
        .catch((error: any) => {
          console.error("Error", error);
        });
      break;
    }
  }
  console.log("Sent! 🎉");
  console.log(`TX hash: ${tx.hash}`);
  console.log("Waiting for receipt...");
  await provider.waitForTransaction(tx.hash, 1, 150000);

  //TODO: UPDATE MILESTONE TO HIGHLIGHT WITHDRAWN HASH
  console.log(`TX details: https://dashboard.tenderly.co/tx/sepolia/${tx.hash}\n`);
}

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    let project;
    const projectId = Number(id);

    await db.transaction(async (tx: any) => {
      try {
        project = await fetchProjectById(Number(projectId))(tx);
        const milestones = await fetchProjectMilestones(projectId)(tx);

        const freelancerAddress = "0x2A6771f180F34E50A0b3301Bcb0A6CbF3804c037";
        const targetCurrency = "usdt";

        // TODO: Check on chain for approved milestones 
        // TODO: Check off chain for non withdrawn milestones and calculate sum
        const withdrawnAmount = milestones.filter(milestone => milestone.is_approved)
                        .reduce((sum, milestone) => sum + Number(milestone.amount), 0);

        transfer(projectId,targetCurrency,freelancerAddress,withdrawnAmount);
        if (!project || !WALLET_MNEMONIC) {
          return res.status(404).end();
        }


      } catch (e) {
        res.status(401).json({
          status: 'Failed',
          message: `Failed to withdraw funds for project id ${id}. Cause ${e}`,
        });
      }
    });
    return res.status(200).json("withdrawn");
  });