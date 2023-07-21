import { Signer, SubmittableExtrinsic } from '@polkadot/api/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { ITuple } from '@polkadot/types/types';
import { WalletAccount } from '@talismn/connect-wallets';

import * as utils from '@/utils';
import { ImbueApiInfo } from '@/utils/polkadot';
import * as polkadot from '@/utils/polkadot';

import {
  BasicTxResponse,
  Contribution,
  Currency,
  Milestone,
  OnchainProjectState,
  Project,
  ProjectOnChain,
  RoundType,
  User,
} from '@/model';

type EventDetails = {
  eventName: string;
};

const eventMapping: Record<string, EventDetails> = {
  contribute: { eventName: 'ContributeSucceeded' },
  submitMilestone: { eventName: 'MilestoneSubmitted' },
  voteOnMilestone: { eventName: 'VoteComplete' },
  approveMilestone: { eventName: 'MilestoneApproved' },
  refund: { eventName: 'NoConfidenceRoundCreated' },
  withraw: { eventName: 'ProjectFundsWithdrawn' },
  createBrief: { eventName: 'BriefSubmitted' },
  commenceWork: { eventName: 'ProjectCreated' },
  submitInitialGrant: { eventName: 'ProjectCreated' },
};

class ChainService {
  imbueApi: ImbueApiInfo;
  user: User;
  constructor(imbueApi: ImbueApiInfo, user: User) {
    this.imbueApi = imbueApi;
    this.user = user;
  }

  public async commenceWork(
    account: WalletAccount,
    briefId: string
  ): Promise<BasicTxResponse> {
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueBriefs.commenceWork(briefId);
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['commenceWork'].eventName
    );
  }

  public async submitInitialGrant(
    account: WalletAccount,
    milestones: any,
    approvers: string[],
    currencyId: number,
    amount: number,
    teasury: string,
    grantID: string
  ): Promise<BasicTxResponse> {
    const extrinsic = this.imbueApi.imbue.api.tx.imbueGrants.createAndConvert(
      milestones,
      approvers,
      currencyId,
      amount * 1e12,
      teasury,
      grantID
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['submitInitialGrant'].eventName
    );
  }

  public async hireFreelancer(
    account: WalletAccount,
    briefOwners: string[],
    freelancerAddress: string,
    budget: bigint,
    initialContribution: bigint,
    briefHash: string,
    currencyId: number,
    milestones: any[]
  ): Promise<BasicTxResponse> {
    const extrinsic = this.imbueApi.imbue.api.tx.imbueBriefs.createBrief(
      briefOwners,
      freelancerAddress,
      budget,
      initialContribution,
      briefHash,
      currencyId,
      milestones
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['createBrief'].eventName
    );
  }

  public async contribute(
    account: WalletAccount,
    projectOnChain: any,
    contribution: bigint
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].projectKey;
    const extrinsic = this.imbueApi.imbue.api.tx.imbueProposals.contribute(
      projectOnChain.roundKey,
      projectId,
      contribution
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['contribute'].eventName
    );
  }

  public async submitMilestone(
    account: WalletAccount,
    projectOnChain: ProjectOnChain,
    milestoneKey: number
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic = this.imbueApi.imbue.api.tx.imbueProposals.submitMilestone(
      projectId,
      milestoneKey
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['submitMilestone'].eventName
    );
  }

  public async voteOnMilestone(
    account: WalletAccount,
    projectOnChain: any,
    milestoneKey: number,
    userVote: boolean
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic = this.imbueApi.imbue.api.tx.imbueProposals.voteOnMilestone(
      projectId,
      milestoneKey,
      userVote
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['voteOnMilestone'].eventName
    );
  }

  public async approveMilestone(
    account: WalletAccount,
    projectOnChain: any,
    milestoneKey: number
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.finaliseMilestoneVoting(
        projectOnChain.roundKey,
        projectId,
        [milestoneKey]
      );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['approveMilestone'].eventName
    );
  }

  public async withdraw(
    account: WalletAccount,
    projectOnChain: any
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.withdraw(projectId);
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['withraw'].eventName
    );
  }

  public async raiseVoteOfNoConfidence(
    account: WalletAccount,
    projectOnChain: any
  ): Promise<BasicTxResponse> {
    const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.raiseVoteOfNoConfidence(projectId);
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      eventMapping['refund'].eventName
    );
  }

  async submitImbueExtrinsic(
    account: WalletAccount,
    extrinsic: SubmittableExtrinsic<'promise'>,
    eventName: string
  ): Promise<BasicTxResponse> {
    const transactionState: BasicTxResponse = {} as BasicTxResponse;
    try {
      const unsubscribe = await extrinsic.signAndSend(
        account.address,
        { signer: account.signer as Signer },
        (result) => {
          this.imbueApi.imbue.api.query.system.events(
            (events: EventRecord[]) => {
              if (!result || !result.status || !events) {
                return;
              }

              events
                .filter(
                  ({ event: { section } }: EventRecord) =>
                    section === 'imbueProposals' ||
                    section === 'imbueBriefs' ||
                    section === 'system'
                )
                .forEach(
                  ({
                    event: { data, method },
                  }: EventRecord): BasicTxResponse => {
                    transactionState.transactionHash = extrinsic.hash.toHex();

                    const [dispatchError] = data as unknown as ITuple<
                      [DispatchError]
                    >;
                    if (dispatchError.isModule) {
                      return this.handleError(transactionState, dispatchError);
                    }

                    if (
                      eventName &&
                      method === eventName &&
                      data[0].toHuman() === account.address
                    ) {
                      transactionState.status = true;
                      transactionState.eventData = data.toHuman();
                      return transactionState;
                    } else if (method === 'ExtrinsicFailed') {
                      transactionState.status = false;
                      transactionState.txError = true;
                      return transactionState;
                    }
                    return transactionState;
                  }
                );

              if (result.isError) {
                transactionState.txError = true;
                return transactionState;
              }

              if (result.isCompleted) {
                unsubscribe();
                return transactionState;
              }
            }
          );
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        transactionState.errorMessage = error.message;
      }
      transactionState.txError = true;
    }
    return transactionState;
  }

  async submitExtrinsic(
    account: WalletAccount,
    extrinsic: SubmittableExtrinsic<'promise'>
  ): Promise<BasicTxResponse> {
    const { web3FromSource } = await import('@polkadot/extension-dapp');
    const injector = await web3FromSource(account.source);
    const transactionState: BasicTxResponse = {} as BasicTxResponse;
    try {
      const unsubscribe = await extrinsic.signAndSend(
        account.address,
        { signer: injector.signer },
        (result) => {
          async () => {
            if (!result || !result.status) {
              return;
            }
            result.events
              .filter(
                ({ event: { section } }: EventRecord) =>
                  section === 'system' || section === 'imbueProposals'
              )
              .forEach(
                ({ event: { method } }: EventRecord): BasicTxResponse => {
                  transactionState.transactionHash = extrinsic.hash.toHex();

                  if (method === 'ExtrinsicSuccess') {
                    transactionState.status = true;
                    return transactionState;
                  } else if (method === 'ExtrinsicFailed') {
                    transactionState.status = false;
                    return transactionState;
                  }
                  return transactionState;
                }
              );

            if (result.isError) {
              transactionState.txError = true;
              return transactionState;
            }

            if (result.isCompleted) {
              unsubscribe();
              return transactionState;
            }
            return transactionState;
          };
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        transactionState.errorMessage = error.message;
      }
      transactionState.txError = true;
      return transactionState;
    }
    return transactionState;
  }

  handleError(
    transactionState: BasicTxResponse,
    dispatchError: DispatchError
  ): BasicTxResponse {
    try {
      const errorMessage = polkadot.getDispatchError(dispatchError);
      transactionState.errorMessage = errorMessage;
      transactionState.txError = true;
    } catch (error) {
      if (error instanceof Error) {
        transactionState.errorMessage = error.message;
      }
      transactionState.txError = true;
    }
    return transactionState;
  }

  public async getProject(projectId: string | number) {
    const project: Project | any = await utils.fetchProjectById(projectId);
    return await this.convertToOnChainProject(project);
  }

  async convertToOnChainProject(project: Project) {
    if (!project?.chain_project_id) return;
    const projectOnChain: any = await this.getProjectOnChain(
      project.chain_project_id
    );

    if (!projectOnChain) {
      return;
    }

    const raisedFunds = BigInt(
      projectOnChain?.raisedFunds?.replaceAll(',', '') || 0
    );
    const milestones = await this.getProjectMilestones(projectOnChain, project);

    // get project state
    let projectState = OnchainProjectState.PendingProjectApproval;
    const userIsInitiator = await this.isUserInitiator(
      this.user,
      projectOnChain
    );
    let projectInContributionRound = false;
    let projectInVotingRound = false;
    let projectInVoteOfNoConfidenceRound = false;

    const lastApprovedMilestoneKey = await this.findLastApprovedMilestone(
      milestones
    );
    const lastHeader = await this.imbueApi.imbue.api.rpc.chain.getHeader();
    const currentBlockNumber = lastHeader.number?.toBigInt();
    const rounds: any[] =
      await this.imbueApi.imbue.api.query.imbueProposals.rounds.entries(
        project.chain_project_id
      );

    for (let i = Object.keys(rounds).length - 1; i >= 0; i--) {
      const [roundType, expiringBlock] = rounds[i];
      const roundTypeHuman = roundType.toHuman()[1];
      const expiringBlockHuman = BigInt(
        expiringBlock.toHuman().replaceAll(',', '')
      );
      if (expiringBlockHuman > currentBlockNumber) {
        if (
          projectOnChain.approvedForFunding &&
          roundTypeHuman == RoundType[RoundType.ContributionRound]
        ) {
          projectInContributionRound = true;
          break;
        } else if (roundTypeHuman == RoundType[RoundType.VotingRound]) {
          projectInVotingRound = true;
          break;
        } else if (roundTypeHuman == RoundType[RoundType.VoteOfNoConfidence]) {
          projectInVoteOfNoConfidenceRound = true;
          break;
        }
      }
    }
    // Initators cannot contribute to their own project
    if (userIsInitiator) {
      if (projectInVotingRound) {
        projectState = OnchainProjectState.OpenForVoting;
      } else if (projectInContributionRound) {
        projectState = OnchainProjectState.OpenForContribution;
      } else if (lastApprovedMilestoneKey >= 0) {
        projectState = OnchainProjectState.OpenForWithdraw;
      } else {
        projectState = OnchainProjectState.PendingMilestoneSubmission;
      }
    } else if (projectInVotingRound) {
      projectState = OnchainProjectState.OpenForVoting;
    } else if (projectInVoteOfNoConfidenceRound) {
      projectState = OnchainProjectState.OpenForVotingOfNoConfidence;
    } else {
      projectState = OnchainProjectState.PendingMilestoneSubmission;
    }

    const convertedProject: ProjectOnChain = {
      id: projectOnChain.milestones[0].projectKey,
      requiredFunds: BigInt(
        projectOnChain.requiredFunds?.replaceAll(',', '') || 0
      ),
      requiredFundsFormatted:
        projectOnChain.requiredFunds?.replaceAll(',', '') / 1e12,
      raisedFunds: raisedFunds,
      raisedFundsFormatted: Number(raisedFunds / BigInt(1e12)),
      withdrawnFunds: BigInt(
        projectOnChain.withdrawnFunds?.replaceAll(',', '') || 0
      ),
      currencyId:
        projectOnChain.currencyId == 'Native'
          ? Currency.IMBU
          : (projectOnChain.currencyId as Currency),
      milestones: milestones,
      contributions: Object.keys(projectOnChain.contributions).map(
        (accountId: string) =>
          ({
            value: BigInt(
              projectOnChain.contributions[accountId].value?.replaceAll(
                ',',
                ''
              ) || 0
            ),
            accountId: accountId,
            timestamp: BigInt(
              projectOnChain.contributions[accountId].timestamp?.replaceAll(
                ',',
                ''
              ) || 0
            ),
          } as Contribution)
      ),
      initiator: projectOnChain.initiator,
      createBlockNumber: BigInt(
        projectOnChain?.createBlockNumber?.replaceAll(',', '') || 0
      ),
      approvedForFunding: projectOnChain.approvedForFunding,
      fundingThresholdMet: projectOnChain.fundingThresholdMet,
      cancelled: projectOnChain.cancelled,
      projectState,
      fundingType: projectOnChain.fundingType,
      // roundKey,
    };

    return convertedProject;
  }

  public async getProjectMilestones(
    projectOnChain: ProjectOnChain,
    projectOffChain: any
  ): Promise<Milestone[]> {
    const milestones: Milestone[] = Object.keys(projectOnChain.milestones)
      .map((milestoneItem: any) => projectOnChain.milestones[milestoneItem])
      .map(
        (milestone: any) =>
          ({
            project_id: projectOffChain.id,
            project_chain_id: Number(milestone.projectKey),
            milestone_key: Number(milestone.milestoneKey),
            name: projectOffChain.milestones[milestone.milestoneKey].name,
            description:
              projectOffChain.milestones[milestone.milestoneKey].description,
            modified:
              projectOffChain.milestones[milestone.milestoneKey].modified,
            percentage_to_unlock: Number(
              projectOffChain.milestones[milestone.milestoneKey]
                .percentage_to_unlock
            ),
            amount: Number(
              projectOffChain.milestones[milestone.milestoneKey].amount
            ),
            is_approved: milestone.isApproved,
          } as Milestone)
      );

    return milestones;
  }

  public async isUserInitiator(
    user: User,
    projectOnChain: ProjectOnChain
  ): Promise<boolean> {
    let userIsInitiator = false;
    const isLoggedIn = user && user.web3Accounts != null;
    if (isLoggedIn) {
      user?.web3Accounts?.forEach((web3Account) => {
        if (web3Account.address == projectOnChain.initiator) {
          userIsInitiator = true;
        }
      });
    }
    return userIsInitiator;
  }

  public async findFirstPendingMilestone(
    milestones: Milestone[]
  ): Promise<number> {
    const firstmilestone = milestones.find(
      (milestone) => !milestone.is_approved
    );
    if (firstmilestone) {
      return firstmilestone.milestone_key;
    }
    return -1;
  }

  public async findLastApprovedMilestone(
    milestones: Milestone[]
  ): Promise<number> {
    const firstmilestone = milestones
      .slice()
      .reverse()
      .find((milestone) => milestone.is_approved);
    if (firstmilestone) {
      return firstmilestone.milestone_key;
    }
    return -1;
  }

  public async getProjectOnChain(chain_project_id: string | number) {
    const projectOnChain: any = (
      await this.imbueApi.imbue.api.query.imbueProposals.projects(
        chain_project_id
      )
    ).toHuman();
    return projectOnChain;
  }

  public async getBalance(accountAddress: string, currencyId: number) {
    switch (currencyId) {
      case Currency.IMBU: {
        const balance: any = await this.imbueApi.imbue.api.query.system.account(
          accountAddress
        );
        const imbueBalance = balance?.data?.free / 1e12;
        return Number(imbueBalance.toFixed(2));
      }
      case Currency.MGX: {
        const mgxResponse: any =
          await this.imbueApi.imbue.api.query.ormlTokens.accounts(
            accountAddress,
            currencyId
          );
        const mgxBalance = mgxResponse.free / 1e18;
        return Number(mgxBalance.toFixed(2));
      }
      default: {
        const accountResponse: any =
          await this.imbueApi.imbue.api.query.ormlTokens.accounts(
            accountAddress,
            currencyId
          );
        const accountBalance = accountResponse.free / 1e12;
        return Number(accountBalance.toFixed(2));
      }
    }
  }
}

export default ChainService;
