/* eslint-disable no-console */
import { initWasm } from '@trustwallet/wallet-core';

import { EVMContract } from '@/model';

export const getCoinType = async (currency: string) => {
  const core = await initWasm();
  const { CoinType } = core;

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
