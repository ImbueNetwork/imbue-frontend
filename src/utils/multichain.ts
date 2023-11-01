/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
import { initWasm } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { Mnemonic, ethers } from "ethers";
import type { EventRecord } from '@polkadot/types/interfaces';

import { fetchProjectById, fetchProjectMilestones, updateMilestoneWithdrawHashs } from '@/lib/models';

import db from '@/db';
import { BasicTxResponse, EVMContract } from '@/model';
import { Currency } from '@/model';

import { handleError, initPolkadotJSAPI } from './polkadot';
import { Keyring } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import { hash } from 'bcryptjs';
import { stat } from 'fs';
import type { DispatchError } from '@polkadot/types/interfaces';

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

export const getBalance = async (projectId: number) => {
  return await db.transaction(async (tx: any) => {
    try {
      const project = await fetchProjectById(Number(projectId))(tx);
      if (!project) {
        throw new Error(`Project id ${projectId} not found`);
      }

      const currencyId = project.currency_id;
      const escrowAddress = project.escrow_address;

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
        const ethBalance = (Number(await ethProvider.getBalance(projectAddress.description())) / 1e18) ?? 0;

        switch (currencyId) {
          case (Currency.ETH): {
            return { eth: ethBalance };
          }
          case (Currency.USDT): {
            const contract = await getEVMContract(currencyId);
            const signer = await ethProvider.getSigner();
            const token = new ethers.Contract(contract.address, ERC_20_ABI, signer);
            const projectBalance = Number(ethers.formatUnits(await token.balanceOf(projectAddress.description()), await token.decimals()));
            return { usdt: projectBalance, eth: ethBalance };
          }
          default:
            return
        }
      }

    } catch (e) {
      throw new Error(`Failed to retreive balance for project id ${projectId}. ${e}`);
    }
  });


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

const transfer = async (projectId: number, currencyId: number, destinationAddress: string, amount: number, approvedMilestones: number[]) => {
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

    if (coinType == CoinType.ethereum) {
      const balance: any = await getBalance(projectId);
      if (balance.eth == 0) {
        throw Error(`Insufficent $ETH balance to cover withdrawal fees`);
      }
    }
    const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
    const privateKeyHex = HexCoding.encode(key.data());
    const sender = new ethers.Wallet(privateKeyHex, ethProvider);
    let withdrawal_transaction: any;
    let imbue_fee_transaction: any;

    switch (currency.toLowerCase()) {
      case "eth":
        const imbueFee = ethers.parseEther((amount * 0.05).toPrecision(5).toString());
        const transferAmount = ethers.parseEther((amount).toPrecision(5).toString()) - imbueFee;
        imbue_fee_transaction = await sender.sendTransaction({ to: treasuryAddress, value: imbueFee });
        withdrawal_transaction = await sender.sendTransaction({ to: destinationAddress, value: transferAmount });
        break;
      case "usdt": {
        const balance: any = await getBalance(projectId);
        if (balance.usdt == 0) {
          throw Error(`Insufficent $USDT balance to cover withdrawal`);
        }
        const contract = await getEVMContract(currencyId);
        const token = new ethers.Contract(contract.address, ERC_20_ABI, sender);
        const imbueFee = ethers.parseUnits((amount * 0.05).toPrecision(5).toString(), contract.decimals);
        const transferAmount = ethers.parseUnits((amount).toPrecision(5).toString(), contract.decimals) - imbueFee;
        imbue_fee_transaction = await token
          .transfer(treasuryAddress, imbueFee);

        withdrawal_transaction = await token
          .transfer(destinationAddress, transferAmount);
        break;
      }
    }
    await ethProvider.waitForTransaction(imbue_fee_transaction.hash, 1, 150000);
    await ethProvider.waitForTransaction(withdrawal_transaction.hash, 1, 150000);

    await db.transaction(async (tx: any) => {
      await updateMilestoneWithdrawHashs(projectId, approvedMilestones, withdrawal_transaction.hash, imbue_fee_transaction.hash)(tx);
    });

    withdrawnAmount = amount;
    return withdrawnAmount;
  } catch (e) {
    throw new Error(`Failed to withdraw funds. ${e}`);
  }
}

export const withdraw = async (projectId: number) => {
  let approvedFundsTotal = 0;
  await db.transaction(async (tx: any) => {
    try {
      const project = await fetchProjectById(Number(projectId))(tx);
      const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
      if (!project) {
        return false;
      }
      let keepCalling = true;
      setTimeout(function () {
        keepCalling = false;
      }, 30000);
      while (keepCalling) {
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
          approvedFundsTotal = offchainApprovedMilestones.filter(milestone => !milestone.withdrawn_offchain)
            .reduce((sum, milestone) => sum + Number(milestone.amount), 0);

          if (approvedFundsTotal > 0) {
            approvedFundsTotal = Number(await transfer(projectId, project.currency_id, project.payment_address, approvedFundsTotal, onchainApprovedMilestoneIds));
          }
          keepCalling = false;
          break;
        }
      }
    } catch (e) {
      throw new Error(`Failed to withdraw funds. ${e}`);
    }
  });

  return approvedFundsTotal
}

export const mintTokens = async (projectId: number, beneficiary:string) => {
  const offchainEscrowBalance: any = await getBalance(projectId);
  const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
  const core = await initWasm();
  const { HDWallet, CoinType } = core;
  const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, '');
  const coinType = CoinType.polkadot;
  const key = wallet.getDerivedKey(coinType, 0, 0, 0);
  const keyring = new Keyring({ type: "sr25519" });
  const sender = keyring.addFromSeed(key.data());
  return await db.transaction(async (tx: any) => {
    try {
      const project = await fetchProjectById(Number(projectId))(tx);
      if (!project) {
        throw new Error(`Failed to mint tokens, Project with id ${projectId} not found.`);
      }
      const currencyId = project?.currency_id;
      const projectCurrency = Currency[currencyId].toLowerCase();
      const currencyBalance = Number(offchainEscrowBalance[projectCurrency]) ?? 0;
      if (currencyBalance == 0) {
        throw new Error("Cannot deposit funds onchain, escrow balance is empty");
      }
      const currency = currencyId < 100 ? currencyId : { ForeignAsset: Number(currencyId) };
      const mintAmount = BigInt(project.total_cost_without_fee! * 1e12);
      let transactionState: BasicTxResponse = {} as BasicTxResponse;
      const extrinsic = imbueApi.api.tx.imbueProposals
        .mintOffchainAssets(
          beneficiary,
          currency,
          mintAmount
        );
      extrinsic
        .signAndSend(sender, ((result: any) => {
          result.events.forEach(
            ({ event: { method, data, index } }: EventRecord) => {
              transactionState.transactionHash = extrinsic.hash.toHex();
              const [dispatchError] = data as unknown as ITuple<
                [DispatchError]
              >;
              if (dispatchError.isModule) {
                transactionState = handleError(transactionState, dispatchError);
                return transactionState
              }
              transactionState.status = true;
              transactionState.txError = method === 'ExtrinsicFailed';
            });
        }));

      return transactionState;
    } catch (e) {
      throw new Error(`Mint assets failed. ${e}`);
    }
  });
};