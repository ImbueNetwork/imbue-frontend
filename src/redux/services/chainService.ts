import { Signer, SubmittableExtrinsic } from '@polkadot/api/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { ITuple } from '@polkadot/types/types';
import type { AnyJson } from '@polkadot/types-codec/types';
import { WalletAccount } from '@talismn/connect-wallets';

import * as utils from '@/utils';
import { handleError, ImbueApiInfo } from '@/utils/polkadot';

import {
  BasicTxResponse,
  Contribution,
  Currency,
  ImbueChainPollResult,
  Milestone,
  OffchainProjectState,
  OnchainProjectState,
  Project,
  ProjectOnChain,
  RoundType,
  User,
  Vote,
} from '@/model';

import { updateMilestone, updateProject } from './projectServices';
const WAIT_FOR_EVENT_IN_MS = 15_000; // WAIT FOR 15 seconds

/* eslint-disable no-unused-vars */
export enum ImbueChainEvent {
  Contribute = 'ContributeSucceeded',
  SubmitMilestone = 'MilestoneSubmitted',
  VoteOnMilestone = 'VoteSubmitted',
  ApproveMilestone = 'MilestoneApproved',
  RaiseNoConfidenceRound = 'NoConfidenceRoundCreated',
  VoteOnNoConfidenceRound = 'NoConfidenceRoundVotedUpon',
  NoConfidenceRoundFinalised = 'NoConfidenceRoundFinalised',
  Withraw = 'ProjectFundsWithdrawn',
  CreateBrief = 'BriefSubmitted',
  CommenceWork = 'ProjectCreated',
  SubmitInitialGrant = 'ProjectCreated',
  MintAsset = 'ForeignAssetMinted'
}

class ChainService {
  imbueApi: ImbueApiInfo;
  user?: User;
  constructor(imbueApi: ImbueApiInfo, user?: User) {
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
      ImbueChainEvent.CommenceWork
    );
  }

  public async submitInitialGrant(
    account: WalletAccount,
    milestones: any,
    approvers: string[],
    currencyId: number,
    amount: number,
    teasury: string,
    grantID: string,
    paymentAddress: string
  ): Promise<BasicTxResponse> {
    let currency: any = currencyId;
    let onchainPaymentAddress: any = null;
    switch (currencyId) {
      case Currency.ETH:
      case Currency.USDT: {
        currency = { ForeignAsset: Currency[currencyId] };
        onchainPaymentAddress = currencyId < 100 ? null : { ETH: `${paymentAddress}` };
        break;
      }
      default: {
        break;
      }
    }    
    const extrinsic = this.imbueApi.imbue.api.tx.imbueGrants.createAndConvert(
      milestones,
      approvers,
      currency,
      amount * 1e12,
      teasury,
      grantID,
      onchainPaymentAddress
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.SubmitInitialGrant
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
    milestones: any[],
    paymentAddress: string,
    onlyFellowshipFreelancers: boolean
  ): Promise<BasicTxResponse> {
    let currency: any = currencyId;
    let onchainPaymentAddress: any = null;
    switch (currencyId) {
      case Currency.ETH:
      case Currency.USDT: {
        currency = { ForeignAsset: Currency[currencyId] };
        onchainPaymentAddress = currencyId < 100 ? null : { ETH: `${paymentAddress}` };
        break;
      }
      default: {
        break;
      }
    }

    const extrinsic = this.imbueApi.imbue.api.tx.imbueBriefs.createBrief(
      briefOwners,
      freelancerAddress,
      budget,
      initialContribution,
      briefHash,
      currency,
      milestones,
      onchainPaymentAddress,
      onlyFellowshipFreelancers
    );

    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.CreateBrief
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
      ImbueChainEvent.Contribute
    );
  }

  public async submitMilestone(
    account: WalletAccount,
    projectId: number | string,
    milestoneKey: number
  ): Promise<BasicTxResponse> {
    const extrinsic = this.imbueApi.imbue.api.tx.imbueProposals.submitMilestone(
      projectId,
      milestoneKey
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.SubmitMilestone
    );
  }

  public async voteOnMilestone(
    account: WalletAccount,
    projectId: any,
    milestoneKey: number,
    userVote: boolean
  ): Promise<BasicTxResponse> {
    // const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic = this.imbueApi.imbue.api.tx.imbueProposals.voteOnMilestone(
      projectId,
      milestoneKey,
      userVote
    );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.VoteOnMilestone
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
      ImbueChainEvent.ApproveMilestone
    );
  }

  public async withdraw(
    account: WalletAccount,
    projectId: string | number | undefined
  ): Promise<BasicTxResponse> {
    // const projectId = projectOnChain.milestones[0].chain_project_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.withdraw(projectId);
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.Withraw
    );
  }

  public async voteOnNoConfidence(
    account: WalletAccount,
    projectId: number | string,
    userVote: boolean
  ): Promise<BasicTxResponse> {
    // const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.voteOnNoConfidenceRound(
        projectId,
        userVote
      );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.VoteOnNoConfidenceRound
    );
  }

  public async pollChainMessage(eventName: string, address: string) {
    const asyncTimeout = (imbueApi: any, address: string) => {
      const timeoutPromise = new Promise((resolve, _) => {
        setTimeout(
          () => resolve(ImbueChainPollResult.EventNotFound),
          WAIT_FOR_EVENT_IN_MS
        );
      });

      const imbuePoll = new Promise((resolve, _) => {
        try {
          imbueApi.imbue.api.query.system.events((events: EventRecord[]) => {
            events
              .filter(
                ({ event: { section } }: EventRecord) =>
                  section === 'imbueProposals' ||
                  section === 'imbueBriefs' ||
                  section === 'system'
              )
              .forEach(({ event: { data, method } }: EventRecord) => {
                if (
                  eventName &&
                  method === eventName &&
                  data[0].toHuman() === address
                ) {
                  resolve(ImbueChainPollResult.EventFound);
                }
              });
          });
        } catch (ex) {
          return false;
        }
      });

      return Promise.race([imbuePoll, timeoutPromise]);
    };
    return (async (imbueApi) => {
      try {
        const result = await asyncTimeout(imbueApi, address);
        return result;
      } catch (ex) {
        return false;
      }
    })(this.imbueApi);
  }

  public async getCompletedUserProjects(userAddress: string) {
    const completedProjects =
      await this.imbueApi.imbue.api.query.imbueProposals.completedProjects(
        userAddress
      );
    return completedProjects.toHuman() as string[];
  }

  public async hasProjectCompleted(
    userAddress: string,
    chain_project_id: number
  ) {
    const completedUserProjects: string[] = await this.getCompletedUserProjects(
      userAddress
    );
    return completedUserProjects.includes(chain_project_id.toString());
  }

  public async getNoConfidenceVoters(chain_project_id: string | number) {
    const lookupKey = [chain_project_id, RoundType.VoteOfNoConfidence, 0];
    const noConfidenceVotes =
      await this.imbueApi.imbue.api.query.imbueProposals.userHasVoted(
        lookupKey
      );
    const voters = Object.keys(
      JSON.parse(JSON.stringify(noConfidenceVotes.toJSON()))
    );
    return voters;
  }

  public async getMilestoneVotes(
    chain_project_id: string | number,
    milestone: number
  ) {
    const lookupKey = [chain_project_id, RoundType.VotingRound, milestone];
    const milestoneVotes = (
      await this.imbueApi.imbue.api.query.imbueProposals.userHasVoted(lookupKey)
    ).toHuman() as Vote[];
    return milestoneVotes;
  }

  public async raiseVoteOfNoConfidence(
    account: WalletAccount,
    projectId: number | string
  ): Promise<BasicTxResponse> {
    // const projectId = projectOnChain.milestones[0].project_chain_id;
    const extrinsic =
      this.imbueApi.imbue.api.tx.imbueProposals.raiseVoteOfNoConfidence(
        projectId
      );
    return await this.submitImbueExtrinsic(
      account,
      extrinsic,
      ImbueChainEvent.RaiseNoConfidenceRound
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
                      return handleError(transactionState, dispatchError);
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

  public async getProject(projectId: string | number) {
    const project: Project | any = await utils.fetchProjectById(projectId);
    return await this.convertToOnChainProject(project);
  }

  public async syncOffChainDb(
    offChainProject: any,
    onChainProject?: ProjectOnChain
  ) {
    if (!onChainProject) {
      const projectHasBeenCompleted = await this.hasProjectCompleted(
        offChainProject.owner,
        offChainProject.chain_project_id
      );
      if (projectHasBeenCompleted) {
        offChainProject.status_id = OffchainProjectState.Completed;
        await updateProject(offChainProject.id, offChainProject);
        offChainProject.milestones.map(async (milestone: any) => {
          await updateMilestone(
            milestone.project_id,
            milestone.milestone_index,
            true
          );
        });
      }
    } else {
      const offChainMilestones = offChainProject.milestones.map(
        (milestone: any) => milestone.is_approved
      );
      const onChainProjectMilestones = onChainProject.milestones.map(
        (milestone) => milestone.is_approved
      );
      const milestonesSynced =
        JSON.stringify(offChainMilestones) ===
        JSON.stringify(onChainProjectMilestones);
      if (!milestonesSynced) {
        offChainProject.milestones.map(async (milestone: any) => {
          await updateMilestone(
            milestone.project_id,
            milestone.milestone_index,
            onChainProject.milestones[milestone.milestone_index].is_approved
          );
        });
      }
    }
    return offChainProject;
  }


  public async convertToOnChainProject(project: Project) {
    if (!project?.chain_project_id) return;
    const chain_project_id = project.chain_project_id;
    const projectOnChain: any = await this.getProjectOnChain(chain_project_id);
    // TODO: Use the below values to construct info for the ui to set the correct states and not need to call the chain again
    const projectVotes: AnyJson = await this.getProjectVotes(chain_project_id);
    const disputeVotes: AnyJson = await this.getOnChainDisputes(chain_project_id);
    const milestoneVotes: AnyJson = await this.getOnChainMilestoneVotes(chain_project_id);
    const projectInVotingWindow = JSON.stringify(milestoneVotes) !== '{}';
    const projectInDisputeWindow = JSON.stringify(disputeVotes) !== '[]';

    console.log("***** projectVotes is");
    console.log(projectVotes);

    console.log("***** disputeVotes is");
    console.log(disputeVotes);

    console.log("***** milestoneVotes is");
    console.log(milestoneVotes);

    console.log("***** projectInVotingWindow is");
    console.log(projectInVotingWindow);

    console.log("***** projectInDisputeWindow is");
    console.log(projectInDisputeWindow);

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
      projectOnChain,
      this.user,
    );
    let projectInContributionRound = false;
    let projectInMilestoneVoting = false;
    let projectInVotingOfNoConfidence = false;

    const lastApprovedMilestoneKey = await this.findLastApprovedMilestone(
      milestones
    );
    const lastHeader = await this.imbueApi.imbue.api.rpc.chain.getHeader();
    const currentBlockNumber = lastHeader.number?.toBigInt();

    const lastUnapprovedMilestone = milestones.find(
      (milestone) => !milestone.is_approved
    );

    const votingRounds: any[] =
      await this.imbueApi.imbue.api.query.imbueProposals.rounds.entries([
        project.chain_project_id,
        lastUnapprovedMilestone?.milestone_index,
      ]);


    const noConfidenceRounds: any[] =
      await this.imbueApi.imbue.api.query.imbueProposals.rounds.entries([
        project.chain_project_id,
        0
      ]);

    const rounds = votingRounds.concat(noConfidenceRounds);

    for (let i = Object.keys(rounds).length - 1; i >= 0; i--) {
      const [roundType, expiringBlock] = rounds[i];
      const roundTypeHuman = roundType.toHuman()[1];
      const expiringBlockHuman = BigInt(
        expiringBlock.toHuman().replaceAll(',', '')
      );

      if (
        expiringBlockHuman > currentBlockNumber
      ) {
        if (
          projectOnChain.approvedForFunding &&
          roundTypeHuman == RoundType[RoundType.ContributionRound]
        ) {
          projectInContributionRound = true;
        } else if (roundTypeHuman == RoundType[RoundType.VotingRound]) {
          projectInMilestoneVoting = true;
        } else if (roundTypeHuman == RoundType[RoundType.VoteOfNoConfidence]) {
          projectInVotingOfNoConfidence = true;
        }
      }
    }
    // Initators cannot contribute to their own project
    if (userIsInitiator) {
      if (projectInMilestoneVoting) {
        projectState = OnchainProjectState.OpenForVoting;
      } else if (projectInContributionRound) {
        projectState = OnchainProjectState.OpenForContribution;
      } else if (lastApprovedMilestoneKey >= 0) {
        projectState = OnchainProjectState.OpenForWithdraw;
      } else {
        projectState = OnchainProjectState.PendingMilestoneSubmission;
      }
    } else if (projectInMilestoneVoting) {
      projectState = OnchainProjectState.OpenForVoting;
    } else if (projectInVotingOfNoConfidence) {
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
      projectInMilestoneVoting,
      projectInVotingOfNoConfidence,
      projectVotes,
      milestoneVotes,
      disputeVotes,
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
          chain_project_id: Number(milestone.projectKey),
          milestone_index: Number(milestone.milestoneKey),
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
    projectOnChain: ProjectOnChain,
    user?: User,
  ): Promise<boolean> {
    let userIsInitiator = false;
    const isLoggedIn = user && user.web3Accounts != null;
    if (user && isLoggedIn) {
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
      return firstmilestone.milestone_index;
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
      return firstmilestone.milestone_index;
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

  public async getProjectVotes(chain_project_id: string | number) {
    const projectVotes: any = (
      await this.imbueApi.imbue.api.query.imbueProposals.individualVoteStore(
        chain_project_id
      )
    ).toJSON();

    return projectVotes;
  }

  public async getOnChainDisputes(chain_project_id: string | number) {
    const disputes: any = (
      await this.imbueApi.imbue.api.query.imbueProposals.projectsInDispute(
        chain_project_id
      )
    ).toJSON();
    return disputes;
  }

  public async getOnChainMilestoneVotes(chain_project_id: string | number) {
    const milestoneVotes: any = (
      await this.imbueApi.imbue.api.query.imbueProposals.milestoneVotes(
        chain_project_id
      )
    ).toJSON();
    return milestoneVotes;
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
