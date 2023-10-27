/* eslint-disable no-console */
import { EVMContract } from '@/model';
import { initWasm, TW, KeyStore } from '@trustwallet/wallet-core';
import { ethers } from "ethers";

export const getCoinType = async (currency: string) => {
  const core = await initWasm();
  const { CoinType, HDWallet, AnySigner, HexCoding, Ethereum, AnyAddress } = core;

  const currencyLookup: Record<string, any> = {
    "eth": CoinType.ethereum,
    "usdt": CoinType.ethereum,
    "atom": CoinType.cosmos,
    "sol": CoinType.solana,
    "matic": CoinType.polygon,
    "dot": CoinType.polkadot,
  };

  return currencyLookup[currency.toLowerCase()];
};


export const getEVMContract = async (currency: string) => {
  const currencyLookup: Record<string, EVMContract> = {
    "usdt": {address: process.env.USDT_CONTRACT_ADDRESS!, decimals: 6},
  };

  return currencyLookup[currency.toLowerCase()];
};
