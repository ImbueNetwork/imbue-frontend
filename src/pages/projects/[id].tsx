/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { Skeleton, Tooltip, Typography } from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { NoConfidenceVoter } from '@/lib/queryServices/projectQueries';
import * as utils from '@/utils';
import { initImbueAPIInfo } from '@/utils/polkadot';

import AccountChoice from '@/components/AccountChoice';
import BackButton from '@/components/BackButton';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import RefundScreen from '@/components/Grant/Refund';
import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';

const Login = dynamic(() => import("@/components/Login"));
const ExpandableDropDowns = dynamic(() => import("@/components/Project/ExpandableMilestone"));

import Impressions from '@/components/Project/Impressions';
import ProjectApprovers from '@/components/Project/ProjectApprovers';
import ProjectBalance from '@/components/Project/ProjectBalance';
const ProjectHint = dynamic(() => import('@/components/Project/ProjectHint'))
import VotingList from '@/components/Project/VotingList/VotingList';
import SuccessScreen from '@/components/SuccessScreen';
import WaitingScreen from '@/components/WaitingScreen';

import freelalncerPic from '@/assets/images/profile-image.png';
import { calenderIcon, shieldIcon, tagIcon } from '@/assets/svgs';
import { timeData } from '@/config/briefs-data';
import {
  Currency,
  ImbueChainPollResult,
  Milestone,
  OffchainProjectState,
  Project,
  User,
} from '@/model';
import { getBrief, getProjectById } from '@/redux/services/briefService';
import ChainService from '@/redux/services/chainService';
import { ImbueChainEvent } from '@/redux/services/chainService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import {
  getProjectNoConfidenceVoters,
  insertNoConfidenceVoter,
  updateProject,
} from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

TimeAgo.addDefaultLocale(en);

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
  // const [onChainProject, setOnChainProject] = useState<ProjectOnChain | any>();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);

  const [raiseVoteOfNoConfidence, setRaiseVoteOfNoConfidence] =
    useState<boolean>(false);

  const [chainLoading, setChainLoading] = useState<boolean>(true);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const projectId: any = router?.query?.id;
  const [firstPendingMilestone, setFirstPendingMilestone] = useState<number>();
  const [isApplicant, setIsApplicant] = useState<boolean>(false);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [projectOwner, setProjectOwner] = useState<User>();
  const [showRefundButton, setShowRefundButton] = useState<boolean>(false);
  // TODO: Create votes table
  const [milestoneVotes, setMilestoneVotes] = useState<any>({});
  const [milestonLoadingTitle, setMilestoneLoadingTitle] = useState<string>("")

  const [projectInMilestoneVoting, setProjectInMilestoneVoting] =
    useState<boolean>();
  const [projectInVotingOfNoConfidence, setProjectInVotingOfNoConfidence] =
    useState<boolean>(false);

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
  const [approverVotedOnRefund, setApproverVotedOnRefund] = useState<boolean>(false);

  const [projectType, setProjectType] = useState<'grant' | 'brief' | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [expandProjectDesc, setExpandProjectDesc] = useState<number>(500);
  const [openVotingList, setOpenVotingList] = useState<boolean>(false);

  // TODO: Create votes table
  const canVote =
    (isApprover &&
      user.web3_address &&
      !Object.keys(milestoneVotes).includes(user.web3_address)) ||
    (projectType === 'brief' && isProjectOwner);


  const approvedMilestones = project?.milestones?.filter?.(
    (milstone: Milestone) => milstone?.is_approved === true
  );

  const timeAgo = new TimeAgo('en-US');
  const timePosted = project?.created
    ? timeAgo.format(new Date(project?.created))
    : 0;


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
    // project = await chainService.syncOffChainDb(project, onChainProjectRes);
    if (project?.chain_project_id && project?.id) {

      // TODO Enable refunds first
      if (project?.approvers?.length && user.web3_address) {
        const userIsApprover = project.approvers?.includes(user.web3_address);
        if (userIsApprover) {
          setShowRefundButton(true);
        }
      }

      if (
        user.web3_address &&
        project.project_in_voting_of_no_confidence
      ) {
        const voters: NoConfidenceVoter[] = await getProjectNoConfidenceVoters(project.id)
        const isApprover = voters?.find(voter => voter.web3_address === user.web3_address)
        if (user?.web3_address && isApprover?.web3_address) {
          setApproverVotedOnRefund(true);
        }
      }
    }

    if (project.owner) {
      switch (project.status_id) {
        case OffchainProjectState.PendingReview:
          setWait(true);
          setWaitMessage('This project is pending review');
          break;
        case OffchainProjectState.ChangesRequested:
          setWait(true);
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
            setWait(true);
          }

          if (!project.chain_project_id && project.brief_id) {
            setWaitMessage(
              `Your project is being created on the chain. This may take up to 6 seconds`
            );
            setWait(true);
          }
          // else {
          //   setWaitMessage(
          //     `Your project is being created on the chain. This may take up to 6 seconds`
          //   );
          // }
          break;
      }
      // if (
      //   project.status_id !== OffchainProjectState.Accepted &&
      //   project.status_id !== OffchainProjectState.Refunded &&
      //   project.status_id !== OffchainProjectState.Completed
      // ) {
      //   setWait(true);
      // }
    }
  };

  const getProject = async () => {
    if (!projectId) return

    try {
      const projectRes: Project = await getProjectById(projectId);

      if (!projectRes) {
        setError({ message: 'No project found!' });
        setLoading(false);
        router.push('/error');
      }

      // showing owner profile if the current user if the applicant freelancer
      let owner;
      let freelancerRes;
      if (projectRes?.brief_id && projectRes?.user_id) {
        setProjectType('brief');

        const brief = await getBrief(projectRes.brief_id);
        owner = brief?.user_id ? await utils.fetchUser(brief?.user_id) : null;
        freelancerRes = await getFreelancerProfile(projectRes?.user_id);

        if (freelancerRes?.user_id === user?.id) setIsApplicant(true)
        if (owner?.id == user?.id) {
          setTargetUser(freelancerRes);
        } else {
          setTargetUser(owner);
        }
      } else {
        setProjectType('grant');
        if (!projectRes?.user_id) return;

        owner = await utils.fetchUser(projectRes?.user_id);
        if (projectRes?.user_id === user?.id) setIsApplicant(true)
        setTargetUser(owner);
      }

      setIsProjectOwner(owner?.id === user.id);
      setProjectOwner(owner);
      setProject(projectRes)
      setFirstPendingMilestone(projectRes.first_pending_milestone ?? -1);
      setProjectInMilestoneVoting(projectRes.project_in_milestone_voting);
      setProjectInVotingOfNoConfidence(projectRes?.project_in_voting_of_no_confidence ?? false);

      if (
        projectRes.status_id === 4 &&
        !projectRes.chain_project_id &&
        projectRes.brief_id
      ) {
        setWait(true);
        return setWaitMessage(
          `Waiting for ${freelancerRes?.display_name} to start the work`
        );
      }

      if (projectRes.status_id === 4 && !projectRes.chain_project_id && projectRes.brief_id) {
        setWait(true)
        return setWaitMessage(
          `Waiting for ${freelancerRes?.display_name} to start the work`
        );
      }

      const totalCost = Number(
        Number(projectRes?.total_cost_without_fee) +
        Number(projectRes?.imbue_fee)
      );
      setRequiredBalance(totalCost * 0.95);

      // api  project response
      await getChainProject(projectRes, freelancerRes);
      setLoading(false);
      setChainLoading(false);

      if (
        projectRes.status_id !== OffchainProjectState.Completed &&
        projectRes.status_id !== OffchainProjectState.Refunded
      ) {
        await syncProject(projectRes)
      }

    } catch (error) {
      console.error(error)
      setError({ message: 'can not find the project ' + error });
    } finally {
      setLoading(false);
      setChainLoading(false);
    }
  };

  const syncProject = async (project: Project) => {
    setMilestoneLoadingTitle("Loading Votes ...")
    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      const onChainProjectRes = await chainService.getProject(projectId);
      console.log("🚀 ~ file: [id].tsx:325 ~ syncProject ~ onChainProjectRes:", onChainProjectRes)

      if (onChainProjectRes?.id && project?.id) {
        const firstPendingMilestoneChain = await chainService.findFirstPendingMilestone(
          onChainProjectRes.milestones
        );
        console.log("🚀 ~ file: [id].tsx:331 ~ syncProject ~ firstPendingMilestoneChain:", firstPendingMilestoneChain)

        if (
          firstPendingMilestoneChain === project.first_pending_milestone &&
          project.project_in_milestone_voting === onChainProjectRes.projectInMilestoneVoting &&
          project.project_in_voting_of_no_confidence === onChainProjectRes.projectInVotingOfNoConfidence
        )
          return

        // setWaitMessage("Syncing project with chain")
        // setWait(true)
        // setMilestoneLoadingTitle("Getting milestone data from chain...")

        const newProject = {
          ...project,
          project_in_milestone_voting: onChainProjectRes.projectInMilestoneVoting,
          first_pending_milestone: firstPendingMilestoneChain,
          project_in_voting_of_no_confidence: onChainProjectRes.projectInVotingOfNoConfidence,
          // milestones: onChainProjectRes.milestones
        }

        project.project_in_milestone_voting = onChainProjectRes.projectInMilestoneVoting
        project.first_pending_milestone = firstPendingMilestoneChain
        project.project_in_voting_of_no_confidence = onChainProjectRes.projectInVotingOfNoConfidence
        // project.milestones = onChainProjectRes.milestones

        await updateProject(project.id, newProject);
        setWait(false)
        setProject(newProject);
        setFirstPendingMilestone(firstPendingMilestoneChain)
        setProjectInMilestoneVoting(onChainProjectRes.projectInMilestoneVoting)
        setProjectInVotingOfNoConfidence(onChainProjectRes.projectInVotingOfNoConfidence)

      }
      // else {
      //   setProject(project);
      //   setFirstPendingMilestone(project.first_pending_milestone ?? -1);
      //   setProjectInMilestoneVoting(project.project_in_milestone_voting);
      //   setProjectInVotingOfNoConfidence(project?.project_in_voting_of_no_confidence ?? false);
      // }

    } catch (error) {
      console.error(error)
      setError({ message: "Could not sync project. ", error })
    } finally {
      setMilestoneLoadingTitle("")
      setLoading(false)
    }
  }


  const refund = async (account: WalletAccount) => {
    if (!project?.id || !project.chain_project_id) return setError({ message: "No project found. Please try reloading the page" })

    // TODO make this a popup value like vote on milestone
    const vote = false;
    setLoading(true);

    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      let pollResult = ImbueChainPollResult.Pending;
      let noConfidencePoll = ImbueChainPollResult.Pending;

      if (projectInVotingOfNoConfidence) {
        const result = await chainService.voteOnNoConfidence(
          account,
          project.chain_project_id,
          vote
        );

        if (!result.txError) {
          pollResult = (await chainService.pollChainMessage(
            ImbueChainEvent.NoConfidenceRoundFinalised,
            account
          )) as ImbueChainPollResult;
          noConfidencePoll = (await chainService.pollChainMessage(
            ImbueChainEvent.VoteOnNoConfidenceRound,
            account
          )) as ImbueChainPollResult;
        }

        while (true) {
          if (result.status || result.txError) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              project.status_id = OffchainProjectState.Refunded;
              await updateProject(project?.id, project);
              await insertNoConfidenceVoter(project?.id, user)

              setSuccess(true);
              setSuccessTitle('Your vote for refund was successful. Project has been refunded.');
              break;
            } else if (noConfidencePoll == ImbueChainPollResult.EventFound) {
              await insertNoConfidenceVoter(project?.id, user)

              setSuccess(true);
              setSuccessTitle('Your vote for refund was successful');
              break;
            } else if (result.status) {
              setSuccess(true);
              setSuccessTitle('Request resolved successfully');
              break;
            } else if (result.txError) {
              setError({ message: result.errorMessage });
              break
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
          project.chain_project_id
        );

        if (!result.txError) {
          pollResult = (await chainService.pollChainMessage(
            ImbueChainEvent.RaiseNoConfidenceRound,
            account
          )) as ImbueChainPollResult;
        }

        while (true) {
          if (result.status || result.txError || pollResult == ImbueChainPollResult.EventFound) {
            if (pollResult == ImbueChainPollResult.EventFound) {

              project.project_in_voting_of_no_confidence = true;
              await updateProject(project?.id, project);
              await insertNoConfidenceVoter(project?.id, user)
              setSuccess(true);
              setSuccessTitle('Vote of no confidence raised.');
            } else if (result.status) {
              setSuccess(true);
              setSuccessTitle('Request resolved successfully.');
            } else if (result.txError) {
              setError({ message: result.errorMessage });
            }
            break;
          }
          await new Promise((f) => setTimeout(f, 1000));
        }
      }
    } catch (error) {
      setError({ message: "Something went wrong. ", error })
    } finally {
      setLoading(false);
    }
  };

  const renderPolkadotJSModal = (
    <div>
      <AccountChoice
        accountSelected={async (account: WalletAccount) => {
          if (raiseVoteOfNoConfidence) {
            refund(account);
          }
        }}
        visible={showPolkadotAccounts}
        setVisible={setShowPolkadotAccounts}
        initiatorAddress={user.web3_address}
        filterByInitiator
      />
    </div>
  );

  return (
    <div className='max-lg:p-[var(--hq-layout-padding)] relative'>
      {isModalOpen && <ProjectHint {...{
        setModalOpen,
        projectType,
        balance,
        requiredBalance,
        project
      }} />}

      {showPolkadotAccounts && renderPolkadotJSModal}

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

            {targetUser?.id && user?.id && targetUser?.id !== user?.id && (
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
                        setRaiseVoteOfNoConfidence(true);
                        // show polkadot account modal
                        setShowPolkadotAccounts(true);
                      }
                    }}
                  >
                    Refund
                  </button>
                </Tooltip>
              </>
            )}
            {projectInVotingOfNoConfidence && (
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
              <ProjectApprovers {...{
                approversPreview,
                project,
                setIsApprover,
                setApproverPreview,
                projectOwner
              }} />
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
                <h3 className='text-lg lg:text-[1.25rem] leading-[1.5] text-imbue-purple-dark font-normal m-0 p-0 flex items-center'>
                  Milestone{' '}
                  {chainLoading && (
                    <span className='text-imbue-purple-dark text-xs ml-2'>
                      loading...
                    </span>
                  )}
                  {!chainLoading && (
                    <span className='text-imbue-purple-dark ml-2'>
                      {approvedMilestones?.length}/{project?.milestones?.length}
                    </span>
                  )}
                </h3>
                {/* mile stone step indicator */}
                <div className='w-full bg-[#E1DDFF] mt-5 h-1 relative my-auto'>
                  <div
                    style={{
                      width: `${(project?.milestones?.filter?.(
                        (m: any) => m?.is_approved
                      )?.length /
                        project?.milestones?.length) *
                        100
                        }%`,
                    }}
                    className='h-full rounded-xl bg-content-primary absolute'
                  ></div>
                  <div className='flex justify-evenly'>
                    {project?.milestones?.map((m: any, i: number) => (
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
                    <ProjectBalance {...{
                      balance,
                      project,
                      user,
                      handlePopUpForUser,
                      setBalance
                    }}
                    />
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
          {chainLoading &&
            project?.milestones?.map((item: any) => (
              <div
                key={
                  'chainLoading__' +
                  item.project_id +
                  ' ' +
                  item.milestone_index
                }
                className='h-20 w-full my-4 px-5 flex justify-between items-center  bg-gray-50 rounded-xl'
              >
                <div className='flex w-full items-center'>
                  <Typography variant='h4' className='w-44'>
                    <Skeleton />
                  </Typography>
                  <Typography variant='h5' className=' ml-5 w-[40%]'>
                    <Skeleton />
                  </Typography>
                </div>
                <div className='flex  items-center'>
                  <Typography variant='body2' className=' w-24 mr-4'>
                    <Skeleton />
                  </Typography>
                  <Typography variant='body2' className=' w-28 mr-9'>
                    <Skeleton />
                  </Typography>
                </div>
              </div>
            ))}

          {project?.milestones?.map?.(
            (milestone: Milestone, index: number) => {
              return (
                <ExpandableDropDowns
                  {
                  ...{
                    setOpenVotingList, approversPreview, firstPendingMilestone, projectInMilestoneVoting, isApplicant, canVote, user, projectType, isProjectOwner, balance,
                    setLoading, setSuccess, setSuccessTitle, setError, project
                  }
                  }
                  key={`${index}-milestone`}
                  index={index}
                  milestone={milestone}
                  modified={milestone?.modified as Date}
                  milestonLoadingTitle={milestonLoadingTitle}
                />
              );
            }
          )}
        </div>

        <Impressions
          project={project}
          firstPendingMilestone={firstPendingMilestone}
          projectInMilestoneVoting={projectInMilestoneVoting}
          approversPreview={approversPreview}
          // votes={votes}
          setOpenVotingList={setOpenVotingList}
          numberOfMileSotnes={project.milestones}
          isChainLoading={chainLoading}
          milestoneLoding={milestonLoadingTitle ? true : false}
        />
      </div>

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
      <SuccessScreen noRetry={!(project?.status_id === OffchainProjectState.Completed)} title={successTitle} open={success} setOpen={setSuccess}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              setSuccess(false);
              if ((project?.status_id !== OffchainProjectState.Completed))
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

      <VotingList
        open={openVotingList}
        firstPendingMilestone={firstPendingMilestone}
        setOpenVotingList={setOpenVotingList}
        approvers={approversPreview}
        chainProjectId={project.chain_project_id}
        projectId={project.id}
        setMilestoneVotes={setMilestoneVotes}
      />
      <BackDropLoader open={loading || userLoading} />
    </div>
  );
}

export default Project;
