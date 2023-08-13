/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { AvatarGroup, Modal, Tooltip } from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import * as utils from '@/utils';
import { getBalance } from '@/utils/helper';
import { initImbueAPIInfo } from '@/utils/polkadot';

import AccountChoice from '@/components/AccountChoice';
import BackButton from '@/components/BackButton';
import ChatPopup from '@/components/ChatPopup';
import { Dialogue } from '@/components/Dialogue';
import ErrorScreen from '@/components/ErrorScreen';
import RefundScreen from '@/components/Grant/Refund';
import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';
import Login from '@/components/Login';
import ProjectStateTag from '@/components/Project/ProjectStateTag';
import SuccessScreen from '@/components/SuccessScreen';
import WaitingScreen from '@/components/WaitingScreen';

import freelalncerPic from '@/assets/images/profile-image.png'
import { calenderIcon, shieldIcon, tagIcon } from '@/assets/svgs';
import { timeData } from '@/config/briefs-data';
import {
  Currency,
  ImbueChainPollResult,
  Milestone,
  OffchainProjectState,
  Project,
  ProjectOnChain,
  User,
} from '@/model';
import { getBrief, getProjectById } from '@/redux/services/briefService';
import ChainService from '@/redux/services/chainService';
import { ImbueChainEvent } from '@/redux/services/chainService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import {
  updateMilestone,
  updateProject,
} from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

TimeAgo.addDefaultLocale(en);

type ExpandableDropDownsProps = {
  milestone: Milestone;
  index: number;
  modified: Date;
  vote: () => void;
  submitMilestone: () => void;
  withdraw: () => void;
};

// const openForVotingTag = (): JSX.Element => {
//   return (
//     <div className='flex flex-row items-center'>
//       <div className='h-[15px] w-[15px] rounded-[7.5px] bg-[#BAFF36]' />
//       <p className='text-xl font-normal leading-[23px] text-[#BAFF36] mr-[27px] ml-[14px]'>
//         Open for Voting
//       </p>
//     </div>
//   );
// };

function Project() {
  const router = useRouter();
  const [project, setProject] = useState<Project | any>({});
  const [targetUser, setTargetUser] = useState<any>({});
  const [onChainProject, setOnChainProject] = useState<ProjectOnChain | any>();
  console.log("🚀 ~ file: [id].tsx:91 ~ Project ~ onChainProject:", onChainProject)
  // const [user, setUser] = useState<User | any>();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [submittingMilestone, setSubmittingMilestone] =
    useState<boolean>(false);
  const [raiseVoteOfNoConfidence, setRaiseVoteOfNoConfidence] =
    useState<boolean>(false);
  const [withdrawMilestone, setWithdrawMilestone] = useState<boolean>(false);
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [votingWalletAccount, setVotingWalletAccount] = useState<
    WalletAccount | any
  >({});
  const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const projectId: any = router?.query?.id || 0;
  const [firstPendingMilestone, setFirstPendingMilestone] = useState<number>();
  const [isApplicant, setIsApplicant] = useState<boolean>(false);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [showRefundButton, setShowRefundButton] = useState<boolean>();
  const [projectInMilestoneVoting, setProjectInMilestoneVoting] =
    useState<boolean>();
  const [projectInVotingOfNoConfidence, setProjectInVotingOfNoConfidence] =
    useState<boolean>();

  const [wait, setWait] = useState<boolean>(false);
  const [waitMessage, setWaitMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [refunded, setRefunded] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [error, setError] = useState<any>();
  const [balance, setBalance] = useState<any>(0);
  const [requiredBalance, setRequiredBalance] = useState<any>(0);
  const [approversPreview, setApproverPreview] = useState<User[]>([]);
  const [isApprover, setIsApprover] = useState<boolean>(false);
  const [approverVotedOnRefund, setApproverVotedOnRefund] =
    useState<boolean>(false);

  const [projectType, setProjectType] = useState<'grant' | 'brief' | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const canVote = isApprover || (projectType === 'brief' && isProjectOwner);
  const [expandProjectDesc, setExpandProjectDesc] = useState<number>(500);

  // fetching the project data from api and from chain
  useEffect(() => {
    if (projectId && !userLoading) {
      getProject();
    }
  }, [projectId, userLoading]);

  const handlePopUpForUser = () => {
    if (!localStorage.getItem('isShown')) {
      localStorage.setItem('isShown', 'true');
      setModalOpen(true);
    }
  };

  const getChainProject = async (project: Project, freelancer: any) => {
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    const onChainProjectRes = await chainService.getProject(projectId);

    project = await chainService.syncOffChainDb(project, onChainProjectRes);
    if (onChainProjectRes) {
      const isApplicant = onChainProjectRes.initiator == user.web3_address;
      setIsApplicant(isApplicant);
      // TODO Enable refunds first
      const userIsApprover = onChainProjectRes.contributions
        .map((c) => c.accountId)
        .includes(user.web3_address!);
      if (userIsApprover) {
        setShowRefundButton(onChainProjectRes.fundingType.Grant);
      }

      const firstPendingMilestone =
        await chainService.findFirstPendingMilestone(
          onChainProjectRes.milestones
        );
      setFirstPendingMilestone(firstPendingMilestone);
      setProjectInMilestoneVoting(onChainProjectRes.projectInMilestoneVoting);
      setProjectInVotingOfNoConfidence(
        onChainProjectRes.projectInVotingOfNoConfidence
      );

      if (
        user.web3_address &&
        onChainProjectRes.projectInVotingOfNoConfidence
      ) {
        const voters = await chainService.getNoConfidenceVoters(
          onChainProjectRes.id
        );
        console.log('**** current voters are ');
        console.log(voters);
        console.log('***** has current user voted? ');
        console.log(voters.includes(user.web3_address));
        if (voters.includes(user.web3_address)) {
          setApproverVotedOnRefund(true);
        }
      }

      setOnChainProject(onChainProjectRes);
    } else if (project.chain_project_id && project.owner) {
      switch (project.status_id) {
        case OffchainProjectState.PendingReview:
          setWaitMessage('This project is pending review');
          break;
        case OffchainProjectState.ChangesRequested:
          setWaitMessage('Changes have been requested');
          break;
        case OffchainProjectState.Refunded:
          setWait(false);
          setRefunded(true);
          break;
        case OffchainProjectState.Completed:
          setWait(false);
          setSuccess(true);
          setSuccessTitle('This project has been successfully delivered!');
          break;
        case OffchainProjectState.Accepted:
          if (!project.chain_project_id) {
            setWaitMessage(
              `Waiting for ${freelancer.display_name} to start the work`
            );
          } else {
            setWaitMessage(
              `Your project is being created on the chain. This may take up to 6 seconds`
            );
          }
          break;
      }
      if (
        project.status_id !== OffchainProjectState.Refunded &&
        project.status_id !== OffchainProjectState.Completed
      ) {
        setWait(true);
      }
    }
  };

  const getProject = async () => {
    try {
      const projectRes: Project = await getProjectById(projectId);
      // showing owner profile if the current user if the applicant freelancer
      let owner;
      let freelancerRes;
      if (!projectRes) {
        setError({ message: 'No project is found!' });
        setLoading(false);
        router.push('/error');
      }
      if (projectRes?.brief_id && projectRes?.user_id) {
        setProjectType('brief');

        const brief = await getBrief(projectRes.brief_id);
        owner = brief?.user_id ? await utils.fetchUser(brief?.user_id) : null;
        freelancerRes = await getFreelancerProfile(projectRes?.user_id);
        if (owner?.id == user?.id) {
          setTargetUser(freelancerRes);
        } else {
          setTargetUser(owner);
        }
      } else {
        setProjectType('grant');
        if (!projectRes?.user_id) return;

        owner = await utils.fetchUser(projectRes?.user_id);
        setTargetUser(owner);
      }

      setIsProjectOwner(owner?.id === user.id);

      setProject(projectRes);

      // setting approver list
      const approversPreviewList = [...approversPreview];

      if (projectRes?.approvers?.length && approversPreviewList.length === 0) {
        projectRes?.approvers.map(async (approverAddress: any) => {
          if (approverAddress === user?.web3_address) setIsApprover(true);

          const approver = await utils.fetchUserByUsernameOrAddress(
            approverAddress
          );
          if (approver?.id) {
            approversPreviewList.push(approver);
          } else {
            approversPreviewList.push({
              id: 0,
              display_name: '',
              profile_photo: '',
              username: '',
              web3_address: approverAddress,
              getstream_token: ''

            });
          }
        });
      } else {
        approversPreviewList.push({
          id: owner?.id,
          display_name: owner?.display_name,
          profile_photo: owner?.profile_photo,
          username: owner?.username,
          web3_address: owner?.web3_address,
          getstream_token: owner?.getstream_token
        });
      }
      setApproverPreview(approversPreviewList);
      // api  project response
      await getChainProject(projectRes, freelancerRes);

      const balance = await getBalance(
        projectRes?.escrow_address,
        projectRes?.currency_id || 0,
        user
      );
      const totalCost = Number(Number(projectRes?.total_cost_without_fee) + Number(projectRes?.imbue_fee));
      setRequiredBalance(totalCost * 0.95);
      if (!balance) {
        handlePopUpForUser();
      }
      setBalance(balance || 0);
    } catch (error) {
      setError({ message: 'can not find the project ' + error });
    } finally {
      setLoading(false);
    }
  };

  // submitting a milestone
  const submitMilestone = async (account: WalletAccount) => {
    setLoading(true);

    const imbueApi = await initImbueAPIInfo();
    // const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const result = await chainService.submitMilestone(
      account,
      onChainProject,
      milestoneKeyInView
    );
    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          setSuccess(true);
          setSuccessTitle('Milestone Submitted Successfully');
        } else if (result.txError) {
          // TODO: show error screen
          setError({ message: result.errorMessage });
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
  };

  // voting on a mile stone
  const voteOnMilestone = async (account: WalletAccount, vote: boolean) => {
    setLoading(true);

    try {
      const imbueApi = await initImbueAPIInfo();
      // const userRes: User | any = await utils.getCurrentUser();
      const chainService = new ChainService(imbueApi, user);

      const result = await chainService.voteOnMilestone(
        account,
        onChainProject,
        milestoneKeyInView,
        vote
      );

      let pollResult = ImbueChainPollResult.Pending;

      if (!result.txError) {
        pollResult = (await chainService.pollChainMessage(
          ImbueChainEvent.ApproveMilestone,
          account
        )) as ImbueChainPollResult;
      }

      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              await updateMilestone(projectId, milestoneKeyInView, true);
            }
            setSuccess(true);
            setSuccessTitle('Your vote was successful');
          } else if (result.txError) {
            setError({ message: result.errorMessage });
          }
          if (pollResult != ImbueChainPollResult.Pending) {
            break;
          }
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } catch (error) {
      setError({ message: 'Could not vote. Please try again later' });
    } finally {
      setLoading(false);
    }
  };

  // withdrawing funds
  const withdraw = async (account: WalletAccount) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const projectMilestones = onChainProject.milestones;
    // const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const result = await chainService.withdraw(account, onChainProject);

    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          const haveAllMilestonesBeenApproved = projectMilestones
            .map((m: any) => m.is_approved)
            .every(Boolean);

          if (haveAllMilestonesBeenApproved) {
            project.status_id = OffchainProjectState.Completed;

            await updateProject(project?.id, project);
          }

          setSuccess(true);
          setSuccessTitle('Withdraw successfull');
        } else if (result.txError) {
          setError({ message: result.errorMessage });
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
  };

  const refund = async (account: WalletAccount) => {
    // TODO make this a popup value like vote on milestone
    const vote = false;
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    if (projectInVotingOfNoConfidence) {
      const result = await chainService.voteOnNoConfidence(
        account,
        onChainProject,
        vote
      );

      let pollResult = ImbueChainPollResult.Pending;
      if (!result.txError) {
        pollResult = (await chainService.pollChainMessage(
          ImbueChainEvent.NoConfidenceRoundFinalised,
          account
        )) as ImbueChainPollResult;
      }

      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              project.status_id = OffchainProjectState.Refunded;
              await updateProject(project?.id, project);
            }
            setSuccess(true);
            setSuccessTitle('Your vote was successful');
          } else if (result.txError) {
            setError({ message: result.errorMessage });
          }
          if (pollResult != ImbueChainPollResult.Pending) {
            break;
          }
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } else {
      const result = await chainService.raiseVoteOfNoConfidence(
        account,
        onChainProject
      );
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            setSuccess(true);
            setSuccessTitle('Vote of no confidence raised.');
          } else if (result.txError) {
            setError({ message: result.errorMessage });
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    }
    setLoading(false);
  };

  const renderPolkadotJSModal = (
    <div>
      <AccountChoice
        accountSelected={async (account: WalletAccount) => {
          if (submittingMilestone) {
            submitMilestone(account);
          } else if (raiseVoteOfNoConfidence) {
            refund(account);
          } else if (withdrawMilestone) {
            withdraw(account);
          } else {
            await setVotingWalletAccount(account);
            await setShowVotingModal(true);
          }
        }}
        visible={showPolkadotAccounts}
        setVisible={setShowPolkadotAccounts}
        initiatorAddress={onChainProject?.initiator}
        filterByInitiator
      />
    </div>
  );

  const renderVotingModal = (
    <Dialogue
      title='Want to appove milestone?'
      // closeDialouge={() => setShowVotingModal(false)}
      actionList={
        <>
          <li className='button-container !bg-transparent !hover:bg-gray-950  !border !border-solid !border-white'>
            <button
              className='primary !bg-transparent !hover:bg-transparent'
              onClick={() => {
                voteOnMilestone(votingWalletAccount, true);
                setShowVotingModal(false);
              }}
            >
              Yes
            </button>
          </li>
          <li className='button-container !bg-transparent !hover:bg-transparent  !border !border-solid !border-white'>
            <button
              className='primary !bg-transparent !hover:bg-transparent'
              onClick={() => {
                voteOnMilestone(votingWalletAccount, false);
                setShowVotingModal(false);
              }}
            >
              No
            </button>
          </li>
        </>
      }
    />
  );

  const approvedMilestones = onChainProject?.milestones?.filter?.(
    (milstone: Milestone) => milstone?.is_approved === true
  );

  const timeAgo = new TimeAgo('en-US');
  const timePosted = project?.created
    ? timeAgo.format(new Date(project?.created))
    : 0;

  const ExpandableDropDowns = ({
    milestone,
    index,
    modified,
    vote,
    submitMilestone,
    withdraw,
  }: ExpandableDropDownsProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className='mb-2 relative bg-white px-5 border border-white rounded-2xl lg:px-12 max-width-750px:!pb-[30px]'>
        <div
          onClick={() => {
            setExpanded(!expanded);
          }}
          className='
          py-6
          flex 
          justify-between 
          w-full 
          items-center 
          max-width-750px:flex-col 
          max-width-750px:flex
          cursor-pointer'
        >
          <div className='flex flex-row max-width-750px:w-full'>
            <h3 className='text-[2rem] text-imbue-purple max-width-750px:text-[24px] font-normal leading-[60px]'>
              Milestone {index + 1}
            </h3>
            <h3 className='text-[1.5rem] break-all text-imbue-purple ml-[32px] font-normal leading-[60px]'>
              {milestone?.name}
            </h3>
          </div>
          <div className='flex flex-row items-center max-width-750px:w-full max-width-750px:justify-between'>
            {milestone?.is_approved
              ? <ProjectStateTag
                dateCreated={modified}
                text='Completed'
                voters={approversPreview}
                allApprovers={approversPreview}
              />
              : milestone?.milestone_key == firstPendingMilestone &&
                projectInMilestoneVoting
                ? <ProjectStateTag
                  dateCreated={modified}
                  text='Completed'
                  voters={approversPreview}
                  allApprovers={approversPreview}
                />
                : <ProjectStateTag
                  dateCreated={modified}
                  text='Pending'
                  voters={approversPreview}
                  allApprovers={approversPreview}
                />
            }
            <Image
              src={require(expanded
                ? '@/assets/svgs/minus_btn.svg'
                : '@/assets/svgs/plus_btn.svg')}
              height={25}
              width={25}
              alt='dropdownstate'
            />
          </div>
        </div>

        <div className={`${!expanded && 'hidden'} mb-6`}>
          <p className='text-[14px] font-normal text-imbue-purple'>
            Percentage of funds to be released{' '}
            <span className=' text-imbue-lemon'>
              {milestone?.percentage_to_unlock}%
            </span>
          </p>
          <p className='text-[14px] font-normal text-imbue-purple'>
            Funding to be released{' '}
            <span className='text-imbue-lemon'>
              {Number(milestone?.amount)?.toLocaleString?.()} $IMBU
            </span>
          </p>

          <p className=' text-base font-normal text-[#3B27C180] break-all leading-[178.15%] mt-[23px] w-[80%]'>
            {milestone?.description}
          </p>

          {!isApplicant &&
            milestone.milestone_key == firstPendingMilestone &&
            projectInMilestoneVoting && (
              <Tooltip
                followCursor
                title={
                  !canVote &&
                  'Only approvers are allowed to vote on a milestone'
                }
              >
                <button
                  className={`primary-btn in-dark w-button ${!canVote && '!bg-gray-300 !text-gray-400'
                    } font-normal max-width-750px:!px-[40px] h-[2.6rem] items-center content-center !py-0 mt-[25px] px-8`}
                  data-testid='next-button'
                  onClick={() => canVote && vote()}
                >
                  Vote
                </button>
              </Tooltip>
            )}

          {(isApplicant || (projectType === 'grant' && isProjectOwner)) &&
            milestone.milestone_key == firstPendingMilestone &&
            !projectInMilestoneVoting &&
            !milestone?.is_approved && (
              <Tooltip
                followCursor
                title={
                  !balance &&
                  'The escrow wallet balance cannot be 0 while submiting a milestone'
                }
              >
                <button
                  className={`primary-btn in-dark w-button mt-3 ${!balance &&
                    '!bg-gray-300 !text-gray-400 !cursor-not-allowed'
                    }`}
                  data-testid='next-button'
                  onClick={() => balance && submitMilestone()}
                >
                  Submit
                </button>
              </Tooltip>
            )}

          {isApplicant && milestone.is_approved && (
            <button
              className={`primary-btn in-dark w-button ${!balance && '!bg-gray-300 !text-gray-400'
                } font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8`}
              data-testid='next-button'
              onClick={() => withdraw()}
              disabled={!balance}
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='max-lg:p-[var(--hq-layout-padding)] relative'>
      <Modal
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          outline: 0,
          border: 'none',
        }}
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className='bg-white rounded-2xl absolute top-28 right-14 min-w-[32.5625rem] py-7 px-6 text-imbue-purple-dark'>
          <div
            onClick={() => setModalOpen(false)}
            className='pb-7 flex-row-reverse cursor-pointer  items-center flex'
          >
            <Image
              className='ml-2'
              src={'/cross.svg'}
              width={30}
              height={30}
              alt='close'
            />
            <p>close</p>
          </div>
          <div className='flex flex-col items-center'>
            <Image
              src={'/round-dimond.svg'}
              height={50}
              width={50}
              alt='rounded dimond'
            />
            <p className='text-3xl pt-3'>Pending</p>
            <p className='py-2'>
              steps required to submit/withdraw a milestone
            </p>
          </div>
          <div className='flex  mt-7 items-center w-full'>
            <Image
              className='bg-transparent drop-shadow-sm mr-3'
              src={'/checked.svg'}
              width={35}
              height={30}
              alt='checked'
            />
            <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
              <p className='flex text-xl flex-col'>
                {projectType}
                <span className='text-xs text-imbue-light-purple-two'>
                  create {projectType}
                </span>
              </p>
              <p className='ml-auto text-imbue-purple text-sm'>Done</p>
            </div>
          </div>
          <div className='flex  mt-2 items-center w-full'>
            <Image
              className='bg-transparent  drop-shadow-sm mr-2'
              src={'/checked.svg'}
              width={40}
              height={30}
              alt='checked'
            />
            <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
              <p className='flex text-xl flex-col'>
                Address
                <span className='text-xs text-imbue-light-purple-two'>
                  copy escrow address and submit this proposal to kusama
                </span>
              </p>
              <p className='ml-auto text-sm text-imbue-purple'>Done</p>
            </div>
          </div>
          <div className='flex  mt-2 items-center w-full'>
            {balance >= requiredBalance ? (
              <Image
                className='bg-transparent  drop-shadow-sm mr-2'
                src={'/checked.svg'}
                width={40}
                height={30}
                alt='checked'
              />
            ) : (
              <Image
                className='bg-transparent  drop-shadow-sm mr-2'
                src={'/unchecked.svg'}
                width={40}
                height={30}
                alt='checked'
              />
            )}

            <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
              <p className='flex text-xl flex-col'>
                Funds deposited
                <span className='text-xs text-imbue-light-purple-two'>
                  Raised through governance
                </span>
              </p>
              {balance >=
                Number(
                  Number(project?.total_cost_without_fee) +
                  Number(project?.imbue_fee)
                ) ? (
                <p className='ml-auto text-sm text-imbue-purple'>Done</p>
              ) : (
                <p className='ml-auto text-sm text-imbue-coral'>Not Done</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {user && showMessageBox && (
        <ChatPopup
          {...{
            showMessageBox,
            setShowMessageBox,
            browsingUser: user,
            targetUser,
          }}
          showFreelancerProfile={!isApplicant}
        />
      )}
      <div className='grid grid-cols-12 gap-5'>
        <div className='col-span-9 flex flex-col gap-[20px] relative bg-background p-12 rounded-3xl'>
          <div className='flex flex-wrap gap-3 lg:gap-4 items-center'>
            <div className='flex items-center  w-full justify-between'>
              <div className='flex items-center'>
                <BackButton className='mr-1 -ml-3' />
                <h3 className='text-[2rem] max-lg:text-[24px] break-all leading-[1.5] font-normal m-0 p-0 text-imbue-purple'>
                  {project?.name}
                </h3>
              </div>
            </div>

            {project?.brief_id && (
              <span
                onClick={() => router.push(`/briefs/${project?.brief_id}`)}
                className=' text-imbue-lemon cursor-pointer text-xs lg:text-base font-normal !m-0 !p-0 hover:underline'
              >
                {`View full ${projectType}`}
              </span>
            )}
          </div>

          <p className='text-sm lg:text-base text-content font-normal leading-[178.15%] lg:w-[80%]'>
            Project Type :{' '}
            <span className='ml-1 capitalize'>{projectType}</span>
          </p>

          <p className='text-base text-content font-normal leading-[178.15%] break-all lg:w-[80%] whitespace-pre-wrap'>
            {project?.description?.length > expandProjectDesc
              ? project?.description?.substring(0, expandProjectDesc) + ' ...'
              : project?.description}
            {project?.description?.length > 500 && (
              <span>
                {project?.description?.length > expandProjectDesc ? (
                  <button
                    onClick={() => setExpandProjectDesc((prev) => prev + 500)}
                    className='mt-3 ml-2 w-fit text-sm hover:underline text-imbue-lemon'
                  >
                    Show more
                  </button>
                ) : (
                  <button
                    onClick={() => setExpandProjectDesc(500)}
                    className='mt-3 ml-2 w-fit text-sm hover:underline text-imbue-lemon'
                  >
                    Show Less
                  </button>
                )}
              </span>
            )}
          </p>

          <p className='text-sm text-content-primary leading-[1.5] m-0 p-0'>
            Posted {timePosted}
          </p>

          <p className='text-imbue-purple text-[1.25rem] font-normal leading-[1.5] mt-[16px] p-0'>
            {isProjectOwner && projectType === 'brief'
              ? 'Freelancer hired'
              : 'Project Owner'}
          </p>

          <div className='flex flex-row items-center max-lg:flex-wrap'>
            <div
              onClick={() =>
                router.push(
                  isProjectOwner
                    ? `/freelancers/${targetUser?.username}`
                    : `/profile/${targetUser?.username}`
                )
              }
              className='flex items-center'
            >
              <Image
                src={
                  targetUser?.profile_image ||
                  targetUser?.profile_photo ||
                  freelalncerPic
                }
                alt='freelaner-icon'
                height={100}
                width={100}
                className='rounded-full cursor-pointer w-14 h-14 object-cover border border-content-primary'
              />

              <p className='text-imbue-purple text-[1.25rem] font-normal leading-[1.5] p-0 mx-7 cursor-pointer'>
                {targetUser?.display_name}
              </p>
            </div>

            {targetUser?.id && targetUser?.id !== user?.id && (
              <button
                onClick={() => setShowMessageBox(true)}
                className='primary-btn in-dark w-button !mt-0 max-lg:!w-full max-lg:!text-center max-lg:!ml-0 max-lg:!mt-5 items-center content-center !py-0 ml-[40px] px-8 max-lg:!mr-0 h-[2.6rem]'
                data-testid='next-button'
              >
                Message
              </button>
            )}

            {showRefundButton && (
              <>
                <Tooltip
                  title={
                    approverVotedOnRefund
                      ? 'Your vote has already been registered'
                      : 'Vote on refunds'
                  }
                  followCursor
                  leaveTouchDelay={10}
                  enterDelay={500}
                  className='cursor-pointer'
                >
                  <button
                    className={`border border-imbue-purple-dark px-6 h-[2.6rem] rounded-full hover:bg-white text-imbue-purple-dark transition-colors ${approverVotedOnRefund &&
                      '!bg-gray-300 !text-gray-400 !border-gray-400 !cursor-not-allowed'
                      }`}
                    onClick={async () => {
                      if (!approverVotedOnRefund) {
                        // set submitting mile stone to true
                        await setRaiseVoteOfNoConfidence(true);
                        // show polkadot account modal
                        await setShowPolkadotAccounts(true);
                      }
                    }}
                  >
                    Refund
                  </button>
                </Tooltip>
              </>
            )}
            {onChainProject && projectInVotingOfNoConfidence && (
              <button
                disabled={true}
                className={
                  ' text-black flex px-5 py-3 text-sm ml-auto rounded-full Rejected-btn'
                }
              >
                Project undergoing vote of no confidence
              </button>
            )}
          </div>

          {project?.approvers && (
            <>
              <p className='text-imbue-purple-dark text-[1.25rem] font-normal leading-[1.5] mt-[16px] p-0'>
                Approvers
              </p>
              {approversPreview?.length > 0 && (
                <div className='flex flex-row flex-wrap gap-4'>
                  {approversPreview?.map((approver: any, index: number) => (
                    <div
                      key={index}
                      className={`flex text-content gap-3 items-center border border-content-primary p-3 rounded-full ${approver?.display_name && 'cursor-pointer'
                        }`}
                      onClick={() =>
                        approver.display_name &&
                        router.push(`/profile/${approver.username}`)
                      }
                    >
                      <Image
                        height={80}
                        width={80}
                        src={
                          approver?.profile_photo ??
                          'http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png'
                        }
                        alt=''
                        className='rounded-full w-10 h-10 object-cover'
                      />
                      <div className='flex flex-col'>
                        <span className='text-base'>
                          {approver?.display_name}
                        </span>
                        <p className='text-xs break-all text-imbue-purple-dark text-opacity-40'>
                          {approver?.web3_address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className='flex flex-col gap-[30px] max-lg:mt-10 col-span-3 bg-background w-full p-12 rounded-3xl'>
          <div className='flex flex-col'>
            <div className='flex flex-row items-start gap-3'>
              <Image
                src={shieldIcon}
                height={24}
                width={24}
                alt={'shieldIcon'}
                className='mt-1'
              />

              <div className='w-full'>
                <h3 className='text-lg lg:text-[1.25rem] leading-[1.5] text-imbue-purple-dark font-normal m-0 p-0 flex'>
                  Milestone{' '}
                  <span className='text-imbue-purple-dark ml-2'>
                    {approvedMilestones?.length}/{project?.milestones?.length}
                  </span>
                </h3>
                {/* mile stone step indicator */}
                <div className='w-full bg-[#E1DDFF] mt-5 h-1 relative my-auto'>
                  <div
                    style={{
                      width: `${(onChainProject?.milestones?.filter?.(
                        (m: any) => m?.is_approved
                      )?.length /
                        onChainProject?.milestones?.length) *
                        100
                        }%`,
                    }}
                    className='h-full rounded-xl bg-content-primary absolute'
                  ></div>
                  <div className='flex justify-evenly'>
                    {onChainProject?.milestones?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`h-4 w-4 ${m.is_approved ? 'bg-content-primary' : 'bg-[#E1DDFF]'
                          } rounded-full -mt-1.5`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col'>
            <div className='flex flex-row items-start gap-3'>
              <Image
                src={tagIcon}
                height={24}
                width={24}
                alt={'dollarSign'}
                className='mt-1'
              />
              <div className='flex flex-col'>
                <h3 className='text-xl leading-[1.5] text-imbue-purple-dark font-normal m-0 p-0'>
                  {Number(
                    Number(project?.total_cost_without_fee) +
                    Number(project?.imbue_fee)
                  )?.toLocaleString()}{' '}
                  ${Currency[project?.currency_id || 0]}
                </h3>
                <div className='text-[1rem] text-imbue-light-purple-two mt-2'>
                  Budget - Fixed
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col'>
            <div className='flex flex-row items-start gap-3'>
              <Image
                src={calenderIcon}
                height={24}
                width={24}
                alt={'calenderIcon'}
                className='mt-1'
              />
              <div className='flex flex-col'>
                <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark  font-normal'>
                  {timeData[project?.duration_id || 0].label}
                </h3>
                <div className='text-[1rem] text-imbue-light-purple-two'>
                  Timeline
                </div>
              </div>
            </div>
          </div>

          {project?.escrow_address && (
            <div className='flex flex-col'>
              <div className='flex flex-row items-start gap-3'>
                <AccountBalanceWalletOutlinedIcon className='mt-1 text-imbue-purple-dark' />
                <div className='flex flex-col'>
                  <h3 className='text-lg flex items-center lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
                    Wallet Address
                    <span
                      onClick={() => setModalOpen(true)}
                      className='bg-indigo-700 ml-2 h-5 w-5 py-1 px-1.5 cursor-pointer text-xs !text-white rounded-full flex justify-center items-center'
                    >
                      ?
                    </span>
                  </h3>
                  <div className='text-[1rem] text-imbue-light-purple-two mt-2 text-xs break-all'>
                    {project?.escrow_address}
                  </div>
                  <div className='text-[1rem] text-imbue-light-purple-two mt-2'>
                    Balance : {balance} ${Currency[project?.currency_id]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {project?.chain_project_id && (
            <div className='flex flex-col'>
              <div className='flex flex-row items-start gap-3'>
                <FingerprintIcon className='mt-1 text-imbue-purple-dark' />
                <div className='flex flex-col'>
                  <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
                    On-Chain Project ID
                  </h3>
                  <div className='text-[1rem] text-imbue-light-purple-two mt-2 text-xs break-all'>
                    {project?.chain_project_id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className='col-span-9'>
          {onChainProject?.milestones?.map?.(
            (milestone: Milestone, index: number) => {
              return (
                <ExpandableDropDowns
                  key={`${index}-milestone`}
                  index={index}
                  milestone={milestone}
                  modified={milestone?.modified as Date}
                  vote={async () => {
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // set submitting mile stone to false
                    await setSubmittingMilestone(false);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                  submitMilestone={async () => {
                    // set submitting mile stone to true
                    await setSubmittingMilestone(true);
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                  withdraw={async () => {
                    // set submitting mile stone to true
                    await setWithdrawMilestone(true);
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                />
              );
            }
          )}
        </div>

        <div className='bg-background rounded-3xl h-full w-full col-span-3 py-6 px-12'>
          <p className='text-content border-b pb-2 text-2xl mb-6'>Impressions</p>
          {
            onChainProject?.milestones?.map?.(
              (milestone: Milestone, index: number) => {
                //TODO: const votedCount = 
                return (
                  <div key={index}
                    className='flex items-center justify-between mb-8'
                  >
                    <div className='flex items-center gap-3'>
                      <p
                        className='text-xl text-content-primary'
                      >
                        Milestone {index + 1}
                      </p>
                      {
                        (approversPreview?.length) && (
                          <AvatarGroup spacing={8} max={approversPreview.length}>
                            {
                              approversPreview.map((approver: any) => {
                                //TODO: if(approver Has voted)
                                return (
                                  <figure key={approver.id} className='w-6 h-6 rounded-full overflow-hidden border border-black'>
                                    <Image height={100} width={100} className='h-full w-full object-cover' src={approversPreview[0]?.profile_photo || freelalncerPic} alt="" />
                                  </figure>
                                )
                              })
                            }
                          </AvatarGroup>
                        )
                      }
                    </div>
                    <p className='text-xl text-content flex flex-wrap items-center'>
                      {
                        firstPendingMilestone !== undefined &&
                          milestone?.milestone_key <= firstPendingMilestone &&
                          projectInMilestoneVoting
                          ? (<>{
                            milestone.is_approved
                              ? <p>Yes({2})</p>
                              : <p>No({2})</p>
                          }</>)
                          : <p className='text-gray-500 text-opacity-30'>Pending</p>
                      }
                    </p>
                  </div>
                )
              }
            )
          }
        </div>
      </div>

      {showPolkadotAccounts && renderPolkadotJSModal}
      {showVotingModal && renderVotingModal}
      <Login
        visible={loginModal}
        setVisible={(val) => {
          setLoginModal(val);
        }}
        redirectUrl={`/project/${projectId}/`}
      />
      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>
      <SuccessScreen title={successTitle} open={success} setOpen={setSuccess}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              setSuccess(false);
              window.location.reload();
            }}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Continue to Project
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to dashboard
          </button>
        </div>
      </SuccessScreen>

      <RefundScreen open={refunded} setOpen={setSuccess} />

      <WaitingScreen title={waitMessage} open={wait} setOpen={setWait}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => window.location.reload()}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Refresh
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to dashboard
          </button>
        </div>
      </WaitingScreen>
      <BackDropLoader open={loading} />
    </div>
  );
}

export default Project;
