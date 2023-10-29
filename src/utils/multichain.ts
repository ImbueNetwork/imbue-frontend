/* eslint-disable no-console */
import { initWasm } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { ethers } from "ethers";

import { EVMContract } from '@/model';
import { Currency } from '@/model';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;

export const getCoinType = async (currencyId: number) => {
  const core = await initWasm();
  const { CoinType } = core;

  const currency = Currency[currencyId];

  const currencyLookup: Record<string, CoinType> = {
    "eth": CoinType.ethereum,
    "usdt": CoinType.ethereum,
    "atom": CoinType.cosmos,
    "sol": CoinType.solana,
    "matic": CoinType.polygon,
    "dot": CoinType.polkadot,
  };
  return currencyLookup[currency.toLowerCase()];
};


export const getEVMContract = async (currencyId: number) => {
  const currency = Currency[currencyId];

  const currencyLookup: Record<string, EVMContract> = {
    "usdt": {address: process.env.USDT_CONTRACT_ADDRESS!, decimals: 6},
  };

  return currencyLookup[currency.toLowerCase()];
};

export const getBalance = async (projectId: number, currencyId: number) => {
  const core = await initWasm();
  const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
  const { HDWallet, AnyAddress, CoinType } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(currencyId);

  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);

  switch(coinType.value) {
    case(CoinType.ethereum.value): {
      const projectBalance = await ethProvider.getBalance(projectAddress.description());
      return Number(projectBalance);
    }
    default:
      return
  }
};

export const generateAddress = async (projectId: number, currencyId: number) => {
  const core = await initWasm();
  const {  HDWallet, AnyAddress } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(currencyId);
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
  return projectAddress.description();
};

export const transfer = async (projectId: number, currencyId: number, destinationAddress: string, amount: number) => {
  const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
  const core = await initWasm();
  const { CoinType, HDWallet, HexCoding } = core;
  if (!WALLET_MNEMONIC) {
    return new Error(`Wallet Mnemonic not populated`);
  }
  const currency = Currency[currencyId];
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
  const sender = new ethers.Wallet(privateKeyHex, ethProvider);
  let tx: any;
  switch (currency.toLowerCase()) {
    case "eth":
      tx = await sender.sendTransaction({ to: destinationAddress, value: ethers.parseEther(amount.toString()) });
      break;
    case "usdt": {
      const contract = await getEVMContract(currencyId);
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

      const signer = await ethProvider.getSigner();
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
  await ethProvider.waitForTransaction(tx.hash, 1, 150000);

  //TODO: UPDATE MILESTONE TO HIGHLIGHT WITHDRAWN HASH
  console.log(`TX details: https://dashboard.tenderly.co/tx/sepolia/${tx.hash}\n`);
}