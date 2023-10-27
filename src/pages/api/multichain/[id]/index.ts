/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';
import { initWasm, TW, KeyStore } from '@trustwallet/wallet-core';
import { ethers } from "ethers";
import { getCoinType, getEVMContract } from '@/utils/evm';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;



export const generateAddress = async (projectId: number, targetCurrency: string) => {
  const core = await initWasm();
  const { CoinType, HDWallet, AnySigner, HexCoding, Ethereum, AnyAddress } = core;


  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(targetCurrency);
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const fromAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
  // await transfer(projectId, "0x6aA5d09d205F1e283Fb3D04d89F51E33F6B22582", 0.005);
  // await transfer(projectId, targetCurrency, "0xF8aC9023D84a597Ea796AC7ca5C6032315Fc14dD", 0.005);
  const transferAmount = 10;
  await transfer(projectId, targetCurrency, "0x2A6771f180F34E50A0b3301Bcb0A6CbF3804c037", transferAmount);
  return fromAddress.description();
};


export const transfer = async (projectId: number, currency: string, destinationAddress = "0x6aA5d09d205F1e283Fb3D04d89F51E33F6B22582", amount: number) => {
  // const RPC_URL = "https://sepolia.drpc.org";
  // const RPC_URL = "http://localhost:8545";
  // const RPC_URL = "http://35.230.152.54:8545";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  console.log("**** currency is ");
  console.log(currency);
  const core = await initWasm();
  const { CoinType, HDWallet, AnySigner, HexCoding, Ethereum, AnyAddress } = core;

  const CURRENCY_COINTYPE_LOOKUP: Record<string, any> = {
    "eth": CoinType.ethereum,
    "usdt": CoinType.ethereum,
    "atom": CoinType.cosmos,
    "sol": CoinType.solana,
    "matic": CoinType.polygon,
    "dot": CoinType.polkadot,
  };
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");


  const coinType = CURRENCY_COINTYPE_LOOKUP[currency];
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const address = AnyAddress.createWithPublicKey(pubKey, coinType);
  const privateKeyHex = HexCoding.encode(key.data());
  const sender = new ethers.Wallet(privateKeyHex, provider);
  const fromAddress = address.description();

  console.log("**** from address is ");
  console.log(fromAddress);

  console.log("**** To address is ");
  console.log(destinationAddress);


  console.log("***** currency is ");
  console.log(currency.toLowerCase());

  console.log("***** amount is ");
  console.log(amount);

  let tx: ethers.TransactionResponse;
  switch (currency.toLowerCase()) {
    case "eth":
      console.log("**** running eth transaction");
      tx = await sender.sendTransaction({ to: destinationAddress, value: ethers.parseEther(amount.toString()) });
      console.log("**** tx now is ");
      console.log(tx);
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
      console.log("**** token is ");
      console.log(token);

      const transferAmount = ethers.parseUnits(amount.toString(), contract.decimals);
      console.log(`numberOfTokens: ${transferAmount}`)

      await token
        .transfer(destinationAddress, transferAmount)
        .then((transferResult: any) => {
          console.log("transferResult", transferResult);
        })
        .catch((error: any) => {
          console.error("Error", error);
        });
      tx = await sender.sendTransaction({ to: destinationAddress, value: ethers.parseEther(amount.toString()) });
      break;
    }

  }




  if (tx) {
    console.log("Sent! 🎉");
    console.log(`TX hash: ${tx.hash}`);
    console.log("Waiting for receipt...");
    await provider.waitForTransaction(tx.hash, 1, 150000).then(() => { });
    const txReceipt = await provider.getTransaction(tx.hash);
    console.log(`TX details: https://dashboard.tenderly.co/tx/sepolia/${tx.hash}\n`);
  }


}

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