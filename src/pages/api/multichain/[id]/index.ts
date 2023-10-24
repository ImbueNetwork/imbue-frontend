/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';
import { initWasm, TW, KeyStore } from '@trustwallet/wallet-core';

const chainLookup: Record<string, number> = {
  "evm": 60,
  "atom": 180,
  "solana": 501,
  "polkadot": 351,
};

// Derivation path
//     m/purpose'/coin_type'/account'/change/address_index
// m/44'/60'/0'/0/0 
// m/44'/60'/0'/0/0 

//@ts-ignore

export const generateAddress = async (projectId: number, targetCurrency: string) => {
  const core = await initWasm();
  const coin_type = chainLookup[targetCurrency.toLowerCase()];
  const eth_derivation_path1 = `m/44'/60'/0'/1`;
  const eth_derivation_path2 = `m/44'/60'/0'/2`;
  const eth_derivation_path3 = `m/44'/60'/0'/3`;



  const cosmos_derivation_path = `m/44'/180'/0'/1`;
  const solana_derivation_path = `m/44'/501'/0'/2`;
  const polkadot_derivation_path = `m/44'/354'/0'/2`;

  const { CoinType, Curve,  HexCoding, HDWallet, AnyAddress, Derivation,  DerivationPath } = core;

  const wallet = HDWallet.create(256, "");
  const mnemonic = wallet.mnemonic();

  const eth_key = wallet.getKey(CoinType.ethereum, eth_derivation_path1);
  const ethPubKey = eth_key.getPublicKey(CoinType.ethereum);
  const ethAddress = AnyAddress.createWithPublicKey(ethPubKey, CoinType.ethereum);
  console.log(`Get Ethereum address1: ${ethAddress.description()}`);

  const eth_key2 = wallet.getKey(CoinType.ethereum, eth_derivation_path2);
  const ethPubKey2 = eth_key2.getPublicKey(CoinType.ethereum);
  const ethAddress2 = AnyAddress.createWithPublicKey(ethPubKey2, CoinType.ethereum);
  console.log(`Get Ethereum address2: ${ethAddress2.description()}`);

  const eth_key3 = wallet.getKey(CoinType.ethereum, eth_derivation_path3);
  const ethPubKey3 = eth_key3.getPublicKey(CoinType.ethereum);
  const ethAddress3 = AnyAddress.createWithPublicKey(ethPubKey3, CoinType.ethereum);
  console.log(`Get Ethereum address3: ${ethAddress3.description()}`);

  // const key2 = wallet.getKey(CoinType.cosmos, cosmos_derivation_path);
  // const pubKey2 = key2.getPublicKeyEd25519();
  // const comosAddress = AnyAddress.createWithPublicKey(pubKey2, CoinType.cosmos);
  // console.log(`Get cosmos address: ${comosAddress.description()}`);

  // const key3 = wallet.getKey(CoinType.solana, solana_derivation_path);
  // const pubKey3 = key3.getPublicKeyEd25519();
  // const solanaAddress = AnyAddress.createWithPublicKey(pubKey3, CoinType.solana);
  // console.log(`Get solana address3: ${solanaAddress.description()}`);

  // const key4 = wallet.getKey(CoinType.polkadot, polkadot_derivation_path);
  // const pubKey4 = key4.getPublicKeyEd25519();
  // const polkadotAddress = AnyAddress.createWithPublicKey(pubKey4, CoinType.polkadot);
  // console.log(`Get polkadot address: ${polkadotAddress.description()}`);

  // const key5 = wallet.getKeyByCurve(Curve.ed25519, polkadot_derivation_path);
  // const pubKey5 = key5.getPublicKey(CoinType.polkadot);
  // const polkadotAddress2 = AnyAddress.createWithPublicKey(pubKey5, CoinType.polkadot);
  // console.log(`Get polkadot address 2: ${polkadotAddress2.description()}`);

  // console.log(CoinType.polkadot.value)

  // const bams = derivation.account;

  // const test = AnyAddress.createWithPublicKeyDerivation(pubKey, CoinType.ethereum, derivation);

  // console.log(`Create wallet: ${mnemonic}`);
  // console.log(`Get Ethereum public key: ${HexCoding.encode(pubKey.data())}`);
  // console.log(`Get Ethereum address: ${address.description()}`);
  // console.log(`CoinType.ethereum.value = ${CoinType.ethereum.value}`);
  // console.log("Ethereum protobuf models: \n", TW.Ethereum);

  return eth_derivation_path;
};

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const {id} = req.query;
    const projectId = Number(id);
    if(!projectId) {
      return res.status(404);
    }

    const targetCurrency = "EVM";
    const derivation_path = await generateAddress(projectId,targetCurrency);

    console.log("**** id is ", id);
    console.log("**** derivation_path is ", derivation_path);
    return res.status(200).json(derivation_path);
  });