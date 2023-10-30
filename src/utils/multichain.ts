/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
import { initWasm } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { ethers } from "ethers";

import { fetchProjectById, fetchProjectMilestones } from '@/lib/models';

import db from '@/db';
import { EVMContract } from '@/model';
import { Currency } from '@/model';

import { initPolkadotJSAPI } from './polkadot';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;
const ERC_20_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]

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
    "usdt": { address: process.env.USDT_CONTRACT_ADDRESS!, decimals: 6 },
  };

  return currencyLookup[currency.toLowerCase()];
};

export const getBalance = async (projectId: number, currencyId: number, escrowAddress?: string) => {
  if (currencyId < 100) {
    const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
    switch (currencyId) {
      case Currency.IMBU: {
        const balance: any = await imbueApi.api.query.system.account(
          escrowAddress
        );
        const imbueBalance = balance?.data?.free / 1e12;
        return Number(imbueBalance.toFixed(2));
      }
      case Currency.MGX: {
        const mgxResponse: any =
          await imbueApi.api.query.ormlTokens.accounts(
            escrowAddress,
            currencyId
          );
        const mgxBalance = mgxResponse.free / 1e18;
        return Number(mgxBalance.toFixed(2));
      }
      default: {
        const accountResponse: any =
          await imbueApi.api.query.ormlTokens.accounts(
            escrowAddress,
            currencyId
          );
        const accountBalance = accountResponse.free / 1e12;
        return Number(accountBalance.toFixed(2));
      }
    }

  } else {
    const core = await initWasm();
    const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
    const { HDWallet, AnyAddress } = core;
    const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
    const coinType: CoinType = await getCoinType(currencyId);

    const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
    const pubKey = key.getPublicKey(coinType);
    const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
    switch (currencyId) {
      case (Currency.ETH): {
        const projectBalance = Number(await ethProvider.getBalance(projectAddress.description())) / 1e18;
        return Number(projectBalance);
      }
      case (Currency.USDT): {
        const contract = await getEVMContract(currencyId);
        const signer = await ethProvider.getSigner();
        const token = new ethers.Contract(contract.address, ERC_20_ABI, signer);
        const projectBalance = ethers.formatUnits(await token.balanceOf(projectAddress.description()), await token.decimals());
        console.log("**** project balance is ");
        console.log(projectBalance);
        return Number(projectBalance);
      }
      default:
        return
    }
  }
};

export const generateAddress = async (projectId: number, currencyId: number) => {
  const core = await initWasm();
  const { HDWallet, AnyAddress } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
  const coinType = await getCoinType(currencyId);
  const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
  const pubKey = key.getPublicKey(coinType);
  const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
  return projectAddress.description();
};

export const transfer = async (projectId: number, currencyId: number, destinationAddress: string, amount: number) => {
  let withdrawnAmount = 0;
  try {
    const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
    const core = await initWasm();
    const { CoinType, HDWallet, HexCoding } = core;
    if (!WALLET_MNEMONIC) {
      return new Error(`Wallet Mnemonic not populated`);
    }
    const currency = Currency[currencyId];
    const treasuryAddress = await generateAddress(0, currencyId);

    const CURRENCY_COINTYPE_LOOKUP: Record<string, any> = {
      "eth": CoinType.ethereum,
      "usdt": CoinType.ethereum,
      "atom": CoinType.cosmos,
      "sol": CoinType.solana,
      "matic": CoinType.polygon,
      "dot": CoinType.polkadot,
    };
    const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC, "");
    const coinType = CURRENCY_COINTYPE_LOOKUP[currency.toLowerCase()];
    const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
    const privateKeyHex = HexCoding.encode(key.data());
    const sender = new ethers.Wallet(privateKeyHex, ethProvider);
    let tx: any;
    let fee_transaction_hash: any;


    switch (currency.toLowerCase()) {
      case "eth":
        const imbueFee = (amount * 0.05 * 1e18);
        const transferAmount = (amount * 1e18) - imbueFee;
        fee_transaction_hash = await sender.sendTransaction({ to: treasuryAddress, value: imbueFee });
        tx = await sender.sendTransaction({ to: destinationAddress, value: transferAmount });
        break;
      case "usdt": {
        const contract = await getEVMContract(currencyId);
        const signer = await ethProvider.getSigner();
        const token = new ethers.Contract(contract.address, ERC_20_ABI, signer);
        const imbueFee = ethers.parseUnits((amount * 0.05).toPrecision(5).toString(),contract.decimals);
        const transferAmount =  ethers.parseUnits((amount).toPrecision(5).toString(),contract.decimals) - imbueFee;
        await token
          .transfer(treasuryAddress, imbueFee)
          .then(async (transferResult: any) => {
            fee_transaction_hash = await transferResult;
          })
          .catch((error: any) => {
            console.error("Error", error);
          });

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
    await ethProvider.waitForTransaction(fee_transaction_hash.hash, 1, 150000);
    await ethProvider.waitForTransaction(tx.hash, 1, 150000);

    //TODO: UPDATE MILESTONE TO HIGHLIGHT WITHDRAWN HASH
    console.log(`imbue fee TX details: https://dashboard.tenderly.co/tx/sepolia/${fee_transaction_hash.hash}\n`);
    console.log(`TX details: https://dashboard.tenderly.co/tx/sepolia/${tx.hash}\n`);
    withdrawnAmount = amount;
    return withdrawnAmount;
  } catch (e) {
    return withdrawnAmount;
  }
  return withdrawnAmount;
}

export const withdraw = async (projectId: number) => {
  let approvedFundsTotal = 0;
  await db.transaction(async (tx: any) => {
    try {
      const project = await fetchProjectById(Number(projectId))(tx);
      if (!project) {
        return false;
      }
      let keepCalling = true;
      setTimeout(function () {
        keepCalling = false;
      }, 30000);

      while (keepCalling) {
        const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
        const projectOnChain: any = (
          await imbueApi.api.query.imbueProposals.projects(
            project.chain_project_id
          )
        ).toHuman();
        const onchainApprovedMilestoneIds: any[] = Object.keys(projectOnChain.milestones)
          .map((milestoneItem: any) => projectOnChain.milestones[milestoneItem])
          .filter((milestone: any) => milestone.isApproved)
          .map((milestone: any) => Number(milestone.milestoneKey));

        const milestones = await fetchProjectMilestones(projectId)(tx);
        const offchainApprovedMilestones = milestones.filter(milestone => milestone.is_approved);

        const milestonesMatch = JSON.stringify(offchainApprovedMilestones.map(milestone => Number(milestone.milestone_index))) == JSON.stringify(onchainApprovedMilestoneIds);

        if (milestonesMatch) {
          approvedFundsTotal = offchainApprovedMilestones.filter(milestone => !milestone.withdrawn)
            .reduce((sum, milestone) => sum + Number(milestone.amount), 0);

          approvedFundsTotal = Number(await transfer(projectId, project.currency_id, project.payment_address, approvedFundsTotal));
          keepCalling = false;
          break;
        }
      }

    } catch (e) {
      console.log("**** error is ");
      console.log(e);
      return approvedFundsTotal;
    }
  });

  return approvedFundsTotal
}