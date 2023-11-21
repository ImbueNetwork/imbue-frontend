/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-constant-condition */
/* eslint-disable react-hooks/exhaustive-deps */
import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { Alert, IconButton, Tooltip } from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
// const ExpandableDropDowns = dynamic(
//   () => import('@/components/Project/ExpandableMilestone')
// );
// const ProjectHint = dynamic(() => import('@/components/Project/ProjectHint'));
// import LoginPopup from '@/components/LoginPopup/LoginPopup';
import { BsChatLeftDots } from 'react-icons/bs';
import { TfiNewWindow } from 'react-icons/tfi';
import { useSelector } from 'react-redux';

import { NoConfidenceVoter } from '@/lib/queryServices/projectQueries';
import * as utils from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import RefundScreen from '@/components/Grant/Refund';
import { LoginPopupContext } from '@/components/Layout';
import { LoginPopupContextType } from '@/components/Layout';
import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';
import { MilestoneProgressBar } from '@/components/MilestoneProgressBar/MilestoneProgressBar';
import ProjectApprovers from '@/components/Project/ProjectApprovers';
import ProjectBalance from '@/components/Project/ProjectBalance';
import ExpandableMilestone from '@/components/Project/V2/ExpandableMilestone';
import MilestoneVoteBox from '@/components/Project/V2/MilestoneVoteBox';
import NoConfidenceBox from '@/components/Project/V2/NoConfidenceVoteBox';
import NoConfidenceList from '@/components/Project/VotingList/NoConfidenceList';
import VotingList from '@/components/Project/VotingList/VotingList';
import VoteModal from '@/components/ReviewModal/VoteModal';
import SuccessScreen from '@/components/SuccessScreen';
import WaitingScreen from '@/components/WaitingScreen';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { timeData } from '@/config/briefs-data';
import {
  Milestone,
  OffchainProjectState,
  Project,
  User,
  VotesResp,
} from '@/model';
import { Currency } from '@/model';
import { getBrief, getProjectById } from '@/redux/services/briefService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { getProjectNoConfidenceVoters } from '@/redux/services/projectServices';
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
  // const [projectHasAttachments, setProjectHasAttachments] = useState<boolean>(false);

  // const [onChainProject, setOnChainProject] = useState<ProjectOnChain | any>();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const projectId: any = router?.query?.id;
  const [firstPendingMilestone, setFirstPendingMilestone] = useState<number>(0);
  const [isApplicant, setIsApplicant] = useState<boolean>(false);
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  const [projectOwner, setProjectOwner] = useState<User>();
  const [milestoneVotes, setMilestoneVotes] = useState<string[]>([]);
  const [projectInVotingOfNoConfidence, setProjectInVotingOfNoConfidence] =
    useState<boolean>(false);

  const [wait, setWait] = useState<boolean>(false);
  const [waitMessage, setWaitMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [refunded, setRefunded] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [error, setError] = useState<any>();
  const [balance, setBalance] = useState<number | undefined>();
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [approversPreview, setApproverPreview] = useState<User[]>([]);
  const [isApprover, setIsApprover] = useState<boolean>(false);
  const [approverVotedOnRefund, setApproverVotedOnRefund] =
    useState<boolean>(false);

  const [projectType, setProjectType] = useState<'grant' | 'brief' | null>(
    null
  );

  const canVote =
    (isApprover &&
      !isApplicant &&
      user?.web3_address &&
      !(
        milestoneVotes?.length && milestoneVotes?.includes(user.web3_address)
      )) ||
    (projectType === 'brief' && isProjectOwner);

  const timeAgo = new TimeAgo('en-US');
  const timePosted = project?.created
    ? timeAgo.format(new Date(project?.created))
    : 0;

  const [isModalOpen, setModalOpen] = useState(false);
  const [projectInMilestoneVoting, setProjectInMilestoneVoting] =
    useState<boolean>();
  const [requiredBalance, setRequiredBalance] = useState<any>(0);
  const approvedMilestones = project?.milestones?.filter?.(
    (milstone: Milestone) => milstone?.is_approved === true
  );

  const [expandProjectDesc, setExpandProjectDesc] = useState<boolean>(false);
  const [openVotingList, setOpenVotingList] = useState<boolean>(false);

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

  const [noConfidenceVoters, setNoConfidenceVoters] = useState<
    NoConfidenceVoter[]
  >([]);
  const [votes, setVotes] = useState<VotesResp | null>(null);

  const getChainProject = async (project: Project, freelancer: any) => {
    // project = await chainService.syncOffChainDb(project, onChainProjectRes);
    if (project?.chain_project_id && project?.id) {

      const noConfidenceResp: NoConfidenceVoter[] = await getProjectNoConfidenceVoters(
        project.id
      );
      setNoConfidenceVoters(noConfidenceResp);

      if (!user.id || !user.web3_address) return

      if (project?.approvers?.length && user?.web3_address) {
        const userIsApprover = project.approvers?.includes(user.web3_address);
        if (userIsApprover) {
          setIsApprover(true);
        }
      }

      if (user?.web3_address && project.project_in_voting_of_no_confidence) {
        const isApprover = noConfidenceResp?.find(
          (voter) => voter.web3_address === user.web3_address
        );
        if (user?.web3_address && isApprover?.web3_address) {
          setApproverVotedOnRefund(true);
        }
      }
    }

    const shouldSeePopup =
      (user?.web3_address && project.approvers?.includes(user.web3_address)) ||
      (freelancer?.id && user?.id === freelancer?.id) ||
      project?.user_id === user?.id

    if (project?.owner && shouldSeePopup) {
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
        case OffchainProjectState.Completed: {
          setWait(false);
          setSuccess(true);
          setSuccessTitle('This project has been successfully delivered!');
          break;
        }
        case OffchainProjectState.Accepted:
          if (!project.chain_project_id) {
            // redirecting freelancer to application if he should start work
            if (user.id === freelancer.user_id) return router.push(`/briefs/${project.brief_id}/applications/${project.id}`)

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
    if (!projectId) return;

    try {
      const projectRes: Project = await getProjectById(projectId);

      if (!projectRes) {
        setError({ message: 'No project found!' });
        setLoading(false);
        // router.push('/error');
      }

      // showing owner profile if the current user if the applicant freelancer
      let owner;
      let freelancerRes;
      if (projectRes?.brief_id && projectRes?.user_id) {
        setProjectType('brief');

        const brief = await getBrief(projectRes.brief_id);
        owner = brief?.user_id ? await utils.fetchUser(brief?.user_id) : null;
        freelancerRes = await getFreelancerProfile(projectRes?.user_id);
        if (freelancerRes?.user_id === user?.id) setIsApplicant(true);

        if (owner?.id === user?.id) {
          setTargetUser(freelancerRes);
        } else {
          setTargetUser(owner);
        }
      } else {
        setProjectType('grant');
        if (!projectRes?.user_id) return;

        owner = await utils.fetchUser(projectRes?.user_id);
        if (projectRes?.user_id === user?.id) setIsApplicant(true);
        setTargetUser(owner);
      }

      // Don't show project if it still an application
      if (projectRes.status_id === OffchainProjectState.PendingReview) {
        return router.push('/dashboard')
      }

      setIsProjectOwner(owner?.id === user.id);
      setProjectOwner(owner);
      setProject(projectRes);
      setFirstPendingMilestone(projectRes.first_pending_milestone ?? -1);
      setProjectInMilestoneVoting(projectRes.project_in_milestone_voting);
      setProjectInVotingOfNoConfidence(
        projectRes?.project_in_voting_of_no_confidence ?? false
      );

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

      const totalCost = Number(
        Number(projectRes?.total_cost_without_fee) +
        Number(projectRes?.imbue_fee)
      );
      setRequiredBalance(totalCost * 0.95);

      // api  project response
      await getChainProject(projectRes, freelancerRes);
      setLoading(false);
      // setChainLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setError({ message: 'can not find the project ' + error });
    } finally {
      setLoading(false);
      // setChainLoading(false);
    }
  };

  const [copied, setCopied] = useState<boolean>(false);

  const copyAddress = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const [openNoRefundList, setOpenNoRefundList] = useState<boolean>(false);
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [votingWalletAccount, setVotingWalletAccount] =
    useState<WalletAccount | null>(null);

  const { setShowLoginPopup } = useContext(
    LoginPopupContext
  ) as LoginPopupContextType;
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);

  const handleMessageBoxClick = () => {
    if (user?.id) {
      setShowMessageBox(true);
    } else {
      setShowLoginPopup({ open: true, redirectURL: `/projects/${projectId}` });
    }
  };

  return (
    <div className='max-lg:p-[var(--hq-layout-padding)] relative'>
      <div
        onClick={() => router.back()}
        className='border border-content group hover:bg-content rounded-full flex items-center justify-center cursor-pointer absolute left-5 top-5'
      >
        <ArrowBackIcon
          className='h-7 w-7 group-hover:text-white'
          color='secondary'
        />
      </div>

      <div className='w-full grid grid-cols-12 bg-white py-5 px-7 rounded-2xl'>
        <div className='col-start-1 col-end-10'>
          <p className='text-black capitalize ml-8'>
            {projectType} information
          </p>
          {/* starting of project section */}
          <div className='border-inherit mt-5 border rounded-xl py-4 px-5'>
            <div className='flex mb-4 items-center justify-between'>
              <p className='text-sm text-[#747474]'>Project Description</p>
              <div className='flex items-center gap-2'>
                {project?.project_in_voting_of_no_confidence && (
                  <button className='px-3 flex items-center gap-2  py-1.5 rounded-full border border-[#EBEAE2] text-sm text-imbue-coral bg-[#FFEBEA] cursor-pointer'>
                    <Image
                      src={require('@/assets/svgs/info-circle-red.svg')}
                      alt=''
                    />
                    Refund Vote in Progress
                  </button>
                )}
                <button
                  className='px-3 flex items-center  py-1.5 rounded-full border border-inherit text-sm text-black cursor-pointer'
                  onClick={() => setExpandProjectDesc((prev) => !prev)}
                >
                  {expandProjectDesc ? 'Hide' : 'View'} full Description
                  <TfiNewWindow className='ml-1.5 text-gray-500' size={14} />
                </button>
              </div>
            </div>
            <h4 className='text-imbue-purple-dark text-2xl'>{project.name}</h4>
            <p className='text-black text-sm py-5 whitespace-pre-wrap break-words'>
              {expandProjectDesc
                ? project?.description
                : project?.description?.substring(0, 500) + ' ...'}
            </p>

            <div className='grid grid-cols-12 gap-3 mt-5'>
              <div className='bg-[#F2F0FF] justify-between py-2 px-3 flex flex-col col-span-4 xl:col-span-2 rounded-md'>
                <p className='text-imbue-purple text-sm'>Posted</p>
                <p className='text-imbue-purple-dark text-sm'>{timePosted}</p>
              </div>
              <div className='bg-[#FFEBEA] flex flex-col justify-between rounded-md py-2 px-3 col-span-8 xl:col-span-3'>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-[#8A5C5A]'>
                    {user.id === projectOwner?.id && projectType === 'brief'
                      ? 'Freelancer'
                      : 'Shared by'}
                  </p>
                  {user.getstream_token !== targetUser.getstream_token && (
                    <p
                      className='px-2 flex text-sm items-center rounded-xl py-1 bg-white text-black cursor-pointer'
                      onClick={handleMessageBoxClick}
                    >
                      <BsChatLeftDots
                        className='text-imbue-purple-dark mr-1'
                        size={16}
                      />
                      Chat
                    </p>
                  )}
                </div>
                <div className='flex items-center space-x-2 mt-8'>
                  <Image
                    src={
                      targetUser.profile_photo ||
                      targetUser.profile_image ||
                      '/profile-image.png'
                    }
                    width={100}
                    height={100}
                    alt='image'
                    className='rounded-full w-10 h-10 object-cover'
                  />
                  <p className='text-imbue-coral'>
                    {targetUser?.display_name}
                  </p>
                </div>
              </div>

              <div className='bg-light-grey flex flex-col justify-between py-3 rounded-md col-span-12 xl:col-span-7'>
                <ProjectApprovers
                  {...{
                    approversPreview,
                    project,
                    setApproverPreview,
                    projectOwner,
                  }}
                />
              </div>
            </div>
            {/* Ending of project section */}
          </div>
          {/* Starting of milestone section */}
          <div className='bg-light-grey text-[#747474] py-5 px-[10px] mt-5 rounded-xl'>
            <div className='flex items-center justify-between mx-6'>
              <p className='text-[#747474] text-sm'>Project Milestones</p>

              {projectType === 'grant' && isApprover && (
                <Tooltip
                  followCursor
                  title='You cannot vote for refund more than once '
                >
                  <button
                    className={`px-5 py-2 ${approverVotedOnRefund
                      ? 'border border-gray-400 bg-light-white opacity-50'
                      : 'border border-imbue-coral text-imbue-coral bg-[#FFF0EF]'
                      } rounded-full`}
                    onClick={() =>
                      !approverVotedOnRefund && setShowPolkadotAccounts(true)
                    }
                  >
                    Vote for Refund
                  </button>
                </Tooltip>
              )}
            </div>

            <div className='grid grid-cols-12 gap-5 mt-10 ml-6'>
              <p className='col-start-1 col-end-7'>Title</p>
              <p className='col-start-7 col-end-9 mr-10 '>Milestone Funding</p>
              <p className='col-start-9 col-end-11'>Milestone ends</p>
              <p className='col-start-11 col-end-13 pr-6 text-end'>Stage</p>
            </div>
            {project?.milestones?.map((item: Milestone, index: number) => (
              <ExpandableMilestone
                {...{
                  project,
                  item,
                  index,
                  isApplicant,
                  projectType,
                  isProjectOwner,
                  setLoading,
                  setError,
                  user,
                  setSuccess,
                  setSuccessTitle,
                  setShowPolkadotAccounts,
                  canVote,
                  loading,
                  setOpenVotingList,
                  targetUser,
                  balance,
                  balanceLoading,
                  // hasMilestoneAttachments: projectHasAttachments
                }}
                key={index}
              />
            ))}
          </div>
        </div>
        {/* Ending of milestone section */}
        {/* starting side bar for project details */}
        <div className='col-start-10 ml-5 row-start-1 row-end-4 col-end-13'>
          <div className='bg-light-grey mt-11 py-3 px-2 rounded-xl'>
            <p className='text-[#747474] text-sm mb-5'>Project Overview</p>
            <div className='space-y-2'>
              <div className='flex gap-4 bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Milestones</p>
                <div className='w-48  mt-6'>
                  <MilestoneProgressBar
                    currentValue={
                      projectInMilestoneVoting
                        ? firstPendingMilestone
                        : firstPendingMilestone === -1
                          ? project?.milestones?.length
                          : firstPendingMilestone - 1
                    }
                    titleArray={project?.milestones}
                  />
                </div>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Timeline</p>
                <p className='text-imbue-purple-dark text-xl mt-5'>
                  {timeData[project?.duration_id || 0].label}
                </p>
              </div>
              <div className='flex flex-col bg-white justify-between px-5 py-3 rounded-xl'>
                <CopyToClipboard text={project?.escrow_address}>
                  <div className='ml-auto'>
                    <IconButton className='' onClick={() => copyAddress()}>
                      <Image
                        className='w-4'
                        src={require('@/assets/svgs/copy.svg')}
                        alt='copy button'
                      />
                    </IconButton>
                  </div>
                </CopyToClipboard>
                <div className='w-full flex justify-between items-end'>
                  <p className='text-black'>Escrow Address</p>
                  <p className='text-imbue-purple-dark text-xl line-clamp-1'>
                    {project?.escrow_address?.slice(0, 6) +
                      '...' +
                      project?.escrow_address?.substr(-3)}
                  </p>
                </div>
              </div>
              <div className='flex flex-col bg-white justify-between px-5 py-3 rounded-xl'>
                <ProjectBalance
                  {...{
                    balance,
                    project,
                    user,
                    handlePopUpForUser,
                    setBalance,
                    balanceLoading,
                    setBalanceLoading
                  }}
                />
                <div className='flex justify-between mt-2'>
                  <p className='text-black'>Total Funding</p>
                  <p className='text-imbue-purple-dark text-xl'>
                    {project.total_cost_without_fee}{' '}
                    {Currency[project.currency_id || 0]}
                  </p>
                </div>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>On-Chain Project ID</p>
                <p className='text-imbue-purple-dark mt-5 text-xl '>
                  {project.chain_project_id}
                </p>
              </div>
            </div>
          </div>

          {/* ending side bar for project details */}
          <div className='bg-white mt-5'>
            {projectInVotingOfNoConfidence && projectType === 'grant' && (
              <div className='col-start-10'>
                <NoConfidenceBox
                  noConfidenceVoters={noConfidenceVoters}
                  setLoadingMain={setLoading}
                  loading={loading}
                  approversCount={approversPreview?.length || 0}
                  {...{
                    setError,
                    project,
                    canVote,
                    isApplicant,
                    user,
                    setOpenVotingList: setOpenNoRefundList,
                    approverVotedOnRefund,
                  }}
                />
              </div>
            )}

            <div className='bg-white col-start-10 px-2 rounded-xl py-3 border border-light-grey'>
              <MilestoneVoteBox
                chainProjectId={project.chain_project_id}
                projectId={project.id}
                approvers={approversPreview}
                setLoadingMain={setLoading}
                firstPendingMilestone={firstPendingMilestone || 0}
                {...{
                  setSuccess,
                  setSuccessTitle,
                  setError,
                  project,
                  canVote,
                  isApplicant,
                  user,
                  setOpenVotingList,
                  approverVotedOnRefund,
                  votes,
                  setVotes,
                  setMilestoneVotes,
                }}
              />
            </div>
          </div>
        </div>
      </div>
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

      <VotingList
        open={openVotingList}
        setOpenVotingList={setOpenVotingList}
        loading={loading}
        votes={votes}
      // setMilestoneVotes={setMilestoneVotes}
      // firstPendingMilestone={firstPendingMilestone}
      // approvers={approversPreview}
      // chainProjectId={project.chain_project_id}
      // projectId={project.id}
      // project={project}
      />

      {openNoRefundList && (
        <NoConfidenceList
          {...{
            open: openNoRefundList,
            setMilestoneVotes,
            approvers: approversPreview,
            setOpenNoRefundList,
            project,
          }}
        />
      )}

      <VoteModal
        visible={showVotingModal}
        setVisible={setShowVotingModal}
        refundOnly={true}
        {...{
          setLoading,
          project,
          user,
          setError,
          votingWalletAccount,
          projectType,
          targetUser,
          approversPreview
        }}
      />

      <Web3WalletModal
        polkadotAccountsVisible={showPolkadotAccounts}
        showPolkadotAccounts={setShowPolkadotAccounts}
        accountSelected={(account) => {
          setVotingWalletAccount(account);
          setShowVotingModal(true);
          setShowPolkadotAccounts(false);
        }}
      />

      <BackDropLoader open={loading || userLoading} />

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
      <SuccessScreen
        noRetry={!(project?.status_id === OffchainProjectState.Completed)}
        title={successTitle}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              setSuccess(false);
              if (project?.status_id !== OffchainProjectState.Completed)
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

      <div
        className={`fixed top-28 z-10 transform duration-300 transition-all ${copied ? 'right-5' : '-right-full'
          }`}
      >
        <Alert severity='success'>
          Grant Wallet Address Copied to clipboard
        </Alert>
      </div>
    </div>
  );
}

export default Project;
