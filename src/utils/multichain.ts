/* eslint-disable no-case-declarations */
/* eslint-disable no-console */
import { Keyring } from '@polkadot/api';
import type { DispatchError, EventRecord } from '@polkadot/types/interfaces';
import type { ITuple } from '@polkadot/types/types';
import { initWasm, WalletCore } from '@trustwallet/wallet-core';
import { CoinGeckoClient } from 'coingecko-api-v3';
import { ethers } from "ethers";

import { fetchProjectById, fetchProjectMilestones, Milestone, updateMilestoneWithdrawHashs } from '@/lib/models';

import db from '@/db';
import { BasicTxResponse } from '@/model';
import { Currency } from '@/model';
import { ImbueChainEvent } from '@/redux/services/chainService';

import { ERC_20_ABI, getEVMContract } from './helper';
import { handleError, initPolkadotJSAPI, PolkadotJsApiInfo } from './polkadot';

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const RPC_URL = process.env.ETH_RPC_URL;


export class MultiChainService {
  static core: WalletCore;
  static imbueApi: PolkadotJsApiInfo;
  public static async build(): Promise<MultiChainService> {
    if (!this.core) {
      this.core = await initWasm();
      this.imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
    }
    return new MultiChainService()
  }

  public getCoinType = async (currencyId: number) => {
    const { CoinType } = MultiChainService.core;
    const currency = Currency[currencyId];

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


  public getBalance = async (projectId: number) => {
    try {
      return await db.transaction(async (tx: any) => {

        const project = await fetchProjectById(Number(projectId))(tx);
        if (!project) {
          throw new Error(`Project id ${projectId} not found`);
        }
        const currencyId = project.currency_id;
        const escrowAddress = project.escrow_address;
        if (currencyId < 100) {
          switch (currencyId) {
            case Currency.IMBU: {
              const balance: any = await MultiChainService.imbueApi.api.query.system.account(
                escrowAddress
              );
              const imbueBalance = balance?.data?.free / 1e12;
              return Number(imbueBalance.toFixed(5));
            }
            case Currency.MGX: {
              const mgxResponse: any =
                await MultiChainService.imbueApi.api.query.ormlTokens.accounts(
                  escrowAddress,
                  currencyId
                );
              const mgxBalance = mgxResponse.free / 1e18;
              return Number(mgxBalance.toFixed(5));
            }
            default: {
              const accountResponse: any =
                await MultiChainService.imbueApi.api.query.ormlTokens.accounts(
                  escrowAddress,
                  currencyId
                );
              const accountBalance = accountResponse.free / 1e12;
              return Number(accountBalance.toFixed(2));
            }
          }

        } else {
          const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
          const { HDWallet, AnyAddress } = MultiChainService.core;
          const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
          const coinType = await this.getCoinType(currencyId);

          const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
          const pubKey = key.getPublicKey(coinType);
          const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
          const ethBalanceInWei = await ethProvider.getBalance(projectAddress.description());
          const ethBalance = Number(ethers.formatEther(ethBalanceInWei));
          switch (currencyId) {
            case (Currency.ETH): {
              return { eth: ethBalance };
            }
            case (Currency.USDT): {
              const contract = await getEVMContract(currencyId);
              if (!contract) {
                throw new Error(`Could not find contract for currency Id ${currencyId}`);
              }
              const signer = await ethProvider.getSigner();
              const token = new ethers.Contract(contract.address, ERC_20_ABI, signer);
              const projectBalance = Number(ethers.formatUnits(await token.balanceOf(projectAddress.description()), await token.decimals()));

              return { usdt: projectBalance, eth: ethBalance };
            }
            default:
              return
          }
        }
      });
    } catch (e) {
      throw new Error(`Failed to retreive balance for project id ${projectId}. ${e}`);
    }
  };

  public generateAddress = async (projectId: number, currencyId: number) => {
    const { HDWallet, AnyAddress } = MultiChainService.core;
    const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, "");
    const coinType = await this.getCoinType(currencyId);
    const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
    const pubKey = key.getPublicKey(coinType);
    const projectAddress = AnyAddress.createWithPublicKey(pubKey, coinType);
    return projectAddress.description();
  };

  public mintTokens = async (projectId: number, beneficiary: string) => {
    const offchainEscrowBalance: any = await this.getBalance(projectId);
    const { HDWallet, CoinType } = MultiChainService.core;
    const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC!, '');
    const coinType = CoinType.polkadot;
    const key = wallet.getDerivedKey(coinType, 0, 0, 0);
    const keyring = new Keyring({ type: "sr25519" });
    const sender = keyring.addFromSeed(key.data());
    const eventName = ImbueChainEvent.MintAsset;
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
        const currency = currencyId < 100 ? currencyId : { ForeignAsset: Currency[currencyId] };
        const mintAmount = BigInt(project.total_cost_without_fee! * 1e12);
        let transactionState: BasicTxResponse = {} as BasicTxResponse;
        transactionState.status = false;
        const extrinsic = MultiChainService.imbueApi.api.tx.imbueProposals
          .mintOffchainAssets(
            beneficiary,
            currency,
            mintAmount
          );
        extrinsic
          .signAndSend(sender, ((result: any) => {
            MultiChainService.imbueApi.api.query.system.events(
              (events: EventRecord[]) => {
                if (!result || !result.status || !events) {
                  return;
                }
                events.forEach(
                  ({ event: { method, data } }: EventRecord) => {
                    transactionState.transactionHash = extrinsic.hash.toHex();
                    const [dispatchError] = data as unknown as ITuple<
                      [DispatchError]
                    >;
                    if (dispatchError.isModule) {
                      transactionState = handleError(transactionState, dispatchError);
                      transactionState.status = true;
                      return transactionState
                    }
                    if (
                      method === eventName &&
                      data[0].toHuman() === sender.address
                    ) {
                      transactionState.status = true;
                      transactionState.eventData = data.toHuman();
                      return transactionState;
                    }
                  });
              });
          }));

        while (!transactionState.status) {
          await new Promise((f) => setTimeout(f, 1000));
        }

        return transactionState;
      } catch (e) {
        throw new Error(`Mint assets failed. ${e}`);
      }
    });
  };

  public withdraw = async (projectId: number, coverFees = false) => {
    let withdrawnFunds = 0;
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
          const milestones = await fetchProjectMilestones(projectId)(tx);
          const approvedMilestones = milestones.filter(milestone => milestone.is_approved);
          const approvedFunds = await this.getApprovedFunds(project, approvedMilestones);
          if (approvedFunds > 0) {
            const withdrawableMilestones = approvedMilestones
              .filter(milestone => !milestone.withdrawn_offchain)
              .map((milestone: any) => Number(milestone.milestone_index));
            const isFinalMilestone = milestones.length == approvedMilestones.length;
            withdrawnFunds = Number(await this.transfer(projectId, project.currency_id, project.payment_address, approvedFunds, withdrawableMilestones, coverFees, isFinalMilestone));
            keepCalling = false;
            break;
          }
        }
      } catch (e: any) {
        throw new Error(e.message);
      }
      return withdrawnFunds
    });
    return withdrawnFunds;
  }

  getApprovedFunds = async (project: any, milestones: Milestone[]) => {
    let approvedFundsTotal = 0;
    let projectCompleted = false;
    const projectOnChain: any = (
      await MultiChainService.imbueApi.api.query.imbueProposals.projects(
        project.chain_project_id
      )
    ).toHuman();

    if (!projectOnChain) {
      const userCompletedProjects: number[] = (await MultiChainService.imbueApi.api.query.imbueProposals.completedProjects(
        project.owner
      )).toJSON() as number[];
      projectCompleted = userCompletedProjects.includes(project.chain_project_id);
    }
    const onchainApprovedMilestoneIds: any[] = projectOnChain ? Object.keys(projectOnChain.milestones)
      .map((milestoneItem: any) => projectOnChain.milestones[milestoneItem])
      .filter((milestone: any) => milestone.isApproved)
      .map((milestone: any) => Number(milestone.milestoneKey)) : [];

    const offchainApprovedMilestones = milestones.filter(milestone => milestone.is_approved);
    const milestonesMatch = JSON.stringify(offchainApprovedMilestones.map(milestone => Number(milestone.milestone_index))) == JSON.stringify(onchainApprovedMilestoneIds);
    if (milestonesMatch || projectCompleted) {
      approvedFundsTotal = offchainApprovedMilestones.filter(milestone => !milestone.withdrawn_offchain)
        .reduce((sum, milestone) => sum + Number(milestone.amount), 0);
    }
    return approvedFundsTotal
  }

  transfer = async (projectId: number, currencyId: number, destinationAddress: string, amount: number, withdrawableMilestones: number[], coverFees = false, isFinalMilestone = false) => {
    let withdrawnAmount = 0;
    const { CoinType, HDWallet, HexCoding } = MultiChainService.core;
    try {
      const CURRENCY_COINTYPE_LOOKUP: Record<string, any> = {
        "eth": CoinType.ethereum,
        "usdt": CoinType.ethereum,
        "atom": CoinType.cosmos,
        "sol": CoinType.solana,
        "matic": CoinType.polygon,
        "dot": CoinType.polkadot,
      };
      const currency = Currency[currencyId];
      const coinType = CURRENCY_COINTYPE_LOOKUP[currency.toLowerCase()];

      if (coinType == CoinType.ethereum) {
        const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
        if (!WALLET_MNEMONIC) {
          return new Error(`Wallet Mnemonic not populated`);
        }
        const treasuryAddress = await this.generateAddress(0, currencyId);
        const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC, "");
        const balance: any = await this.getBalance(projectId);
        if (balance.eth == 0 && !coverFees) {
          throw Error(`Insufficent $ETH balance to cover withdrawal fees`);
        }

        const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
        const privateKeyHex = HexCoding.encode(key.data());
        const sender = new ethers.Wallet(privateKeyHex, ethProvider);
        let withdrawal_transaction: any;
        let imbue_fee_transaction: any;

        switch (currencyId) {
          case Currency.ETH:
            if (isFinalMilestone) {
              const currentEthBalance = Number(balance.eth);
              amount = currentEthBalance
            }
            const imbueFee = ethers.parseEther((amount * 0.05).toPrecision(5).toString());
            const additionalFees = await this.estimateGasCostsInEth(projectId, currencyId, destinationAddress, amount, true);
            const transferAmount = ethers.parseEther((amount).toPrecision(5).toString()) - imbueFee - ethers.parseEther((additionalFees).toPrecision(5).toString());
            imbue_fee_transaction = await sender.sendTransaction({ to: treasuryAddress, value: imbueFee });
            withdrawal_transaction = await sender.sendTransaction({ to: destinationAddress, value: transferAmount });
            break;
          case Currency.USDT: {
            const balance: any = await this.getBalance(projectId);
            if (balance.usdt < amount) {
              throw Error(`Insufficent $USDT balance to cover withdrawal`);
            }
            const contract = await getEVMContract(currencyId);
            if (!contract) {
              throw Error(`Cannot find contract for currency id ${currencyId}`);
            }
            const token = new ethers.Contract(contract.address, ERC_20_ABI, sender);
            let imbueFee = ethers.parseUnits((amount * 0.05).toPrecision(5).toString(), contract.decimals);
            if (coverFees) {
              const initialTransferCost = await this.estimateGasCostsInEth(projectId, currencyId, destinationAddress, amount);
              const additionalFees = await this.estimateGasCostsInEth(projectId, currencyId, destinationAddress, amount, true);
              const escrowEthBalance: any = (await this.getBalance(projectId));
              const accountTopupRequired = Number(escrowEthBalance.eth) < initialTransferCost;
              if (accountTopupRequired) {
                const treasuryKey = wallet.getDerivedKey(CoinType.ethereum, 0, 0, 0);
                const treasuryKeyHex = HexCoding.encode(treasuryKey.data());
                const treasurySender = new ethers.Wallet(treasuryKeyHex, ethProvider);
                const treasuryTransferAmount = ethers.parseEther((initialTransferCost).toPrecision(5).toString());
                const escrowAddress = await this.generateAddress(projectId, currencyId);
                const treasuryTx = await treasurySender.sendTransaction({ to: escrowAddress, value: treasuryTransferAmount });
                await ethProvider.waitForTransaction(treasuryTx.hash, 1, 150000);
                const additionalFeesInEscrowAddress = await this.convertEthToEscrowCurrency(currencyId, additionalFees)
                imbueFee = imbueFee + ethers.parseUnits((additionalFeesInEscrowAddress).toPrecision(5).toString(), contract.decimals);
              }
            }
            const transferAmount = ethers.parseUnits((amount).toPrecision(5).toString(), contract.decimals) - imbueFee;
            imbue_fee_transaction = await token
              .transfer(treasuryAddress, imbueFee);
            withdrawal_transaction = await token
              .transfer(destinationAddress, transferAmount);
            await ethProvider.waitForTransaction(imbue_fee_transaction.hash, 1, 150000);
            await ethProvider.waitForTransaction(withdrawal_transaction.hash, 1, 150000);
            break;
          }
        }

        await db.transaction(async (tx: any) => {
          await updateMilestoneWithdrawHashs(projectId, withdrawableMilestones, withdrawal_transaction.hash, imbue_fee_transaction.hash)(tx);
        });
      }
      withdrawnAmount = amount;
      return withdrawnAmount;
    } catch (e) {
      throw new Error(`Failed to withdraw funds. ${e}`);
    }
  }

  estimateGasCostsInEth = async (projectId: number, currencyId: number, destinationAddress: string, amount: number, includeTreasuryCover = false) => {
    let withdrawal_gas_cost: any;
    let imbue_fee_gas_cost: any;
    let totalGasCost = 0;
    const bufferCost = 1.1;
    try {
      const ethProvider = new ethers.JsonRpcProvider(RPC_URL);
      const gasPrice = (await ethProvider.getFeeData()).gasPrice;
      if (!gasPrice) {
        return totalGasCost
      }
      const { HDWallet, HexCoding } = MultiChainService.core;
      if (!WALLET_MNEMONIC) {
        return totalGasCost;
      }
      const treasuryAddress = await this.generateAddress(0, currencyId);
      const wallet = HDWallet.createWithMnemonic(WALLET_MNEMONIC, "");
      const coinType = await this.getCoinType(currencyId);
      const key = wallet.getDerivedKey(coinType, projectId, 0, projectId);
      const privateKeyHex = HexCoding.encode(key.data());
      const sender = new ethers.Wallet(privateKeyHex, ethProvider);
      switch (currencyId) {
        case Currency.ETH: {
          const imbueFee = ethers.parseUnits((amount * 0.05).toPrecision(5).toString());
          const transferAmount = ethers.parseUnits((amount).toPrecision(5).toString()) - imbueFee;
          imbue_fee_gas_cost = await sender.estimateGas({ to: treasuryAddress, value: imbueFee });
          withdrawal_gas_cost = await sender.estimateGas({ to: treasuryAddress, value: transferAmount });
          break;
        }
        case Currency.USDT: {
          const contract = await getEVMContract(currencyId);
          if (!contract) {
            throw new Error(`Could not find contract for currency Id ${currencyId}`);
          }
          const token = new ethers.Contract(contract.address, ERC_20_ABI, sender);
          const imbueFee = ethers.parseUnits((amount * 0.05).toPrecision(5).toString(), contract.decimals);
          const transferAmount = ethers.parseUnits((amount).toPrecision(5).toString(), contract.decimals) - imbueFee;
          imbue_fee_gas_cost = await token.transfer.estimateGas(treasuryAddress, imbueFee);
          withdrawal_gas_cost = await token.transfer.estimateGas(destinationAddress, transferAmount);
          break;
        }
      }

      const gasAmount = includeTreasuryCover ? BigInt(imbue_fee_gas_cost + imbue_fee_gas_cost + withdrawal_gas_cost) : BigInt(imbue_fee_gas_cost + withdrawal_gas_cost);
      const gasFeeInWei = gasAmount * gasPrice;
      const gasFeeInETH = ethers.formatEther(gasFeeInWei);
      totalGasCost = Number((Number(gasFeeInETH) * bufferCost).toPrecision(5));
      return totalGasCost;
    } catch (e) {
      throw new Error(`Failed to estimate gas costs. ${e}`);
    }
  }

  convertEthToEscrowCurrency = async (currencyId: number, amount: number) => {
    let feesInEscrowCurrency = 0
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });

    switch (currencyId) {
      case Currency.USDT: {
        const exchangeRate = Number((await client.simplePrice({
          vs_currencies: "eth",
          ids: "tether"
        }))['tether'].eth);
        feesInEscrowCurrency = amount / exchangeRate;
      }
    }

    return feesInEscrowCurrency;

  }
}