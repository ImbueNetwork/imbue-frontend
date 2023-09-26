/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { LinearProgress, Modal, Skeleton, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { WalletAccount } from '@talismn/connect-wallets';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { TfiNewWindow } from 'react-icons/tfi';
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

const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));
const ExpandableDropDowns = dynamic(
  () => import('@/components/Project/ExpandableMilestone')
);

import Impressions from '@/components/Project/Impressions';
import ProjectApprovers from '@/components/Project/ProjectApprovers';
import ProjectBalance from '@/components/Project/ProjectBalance';
const ProjectHint = dynamic(() => import('@/components/Project/ProjectHint'));
// import LoginPopup from '@/components/LoginPopup/LoginPopup';
import classNames from 'classnames';
import { BsChatLeftDots } from 'react-icons/bs';

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
import { MilestoneProgressBar } from '@/components/MilestoneProgressBar/MilestoneProgressBar';
import ReviewModal from '@/components/ReviewModal/ReviewModal';
import VoteModal from '@/components/ReviewModal/VoteModal';

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
  const [milestonLoadingTitle, setMilestoneLoadingTitle] = useState<string>('');

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
  const [approverVotedOnRefund, setApproverVotedOnRefund] =
    useState<boolean>(false);

  const [projectType, setProjectType] = useState<'grant' | 'brief' | null>(
    null
  );
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

      if (user.web3_address && project.project_in_voting_of_no_confidence) {
        const voters: NoConfidenceVoter[] = await getProjectNoConfidenceVoters(
          project.id
        );
        const isApprover = voters?.find(
          (voter) => voter.web3_address === user.web3_address
        );
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
    if (!projectId) return;

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

        if (freelancerRes?.user_id === user?.id) setIsApplicant(true);
        if (owner?.id == user?.id) {
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
      setChainLoading(false);

      if (
        projectRes.status_id !== OffchainProjectState.Completed &&
        projectRes.status_id !== OffchainProjectState.Refunded
      ) {
        await syncProject(projectRes);
      }
    } catch (error) {
      console.error(error);
      setError({ message: 'can not find the project ' + error });
    } finally {
      setLoading(false);
      setChainLoading(false);
    }
  };

  const syncProject = async (project: Project) => {
    setMilestoneLoadingTitle('Loading Votes ...');
    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      const onChainProjectRes = await chainService.getProject(projectId);
      console.log(
        '🚀 ~ file: [id].tsx:325 ~ syncProject ~ onChainProjectRes:',
        onChainProjectRes
      );

      if (onChainProjectRes?.id && project?.id) {
        const firstPendingMilestoneChain =
          await chainService.findFirstPendingMilestone(
            onChainProjectRes.milestones
          );
        console.log(
          '🚀 ~ file: [id].tsx:331 ~ syncProject ~ firstPendingMilestoneChain:',
          firstPendingMilestoneChain
        );

        if (
          firstPendingMilestoneChain === project.first_pending_milestone &&
          project.project_in_milestone_voting ===
            onChainProjectRes.projectInMilestoneVoting &&
          project.project_in_voting_of_no_confidence ===
            onChainProjectRes.projectInVotingOfNoConfidence
        )
          return;

        // setWaitMessage("Syncing project with chain")
        // setWait(true)
        // setMilestoneLoadingTitle("Getting milestone data from chain...")

        const newProject = {
          ...project,
          project_in_milestone_voting:
            onChainProjectRes.projectInMilestoneVoting,
          first_pending_milestone: firstPendingMilestoneChain,
          project_in_voting_of_no_confidence:
            onChainProjectRes.projectInVotingOfNoConfidence,
          // milestones: onChainProjectRes.milestones
        };

        project.project_in_milestone_voting =
          onChainProjectRes.projectInMilestoneVoting;
        project.first_pending_milestone = firstPendingMilestoneChain;
        project.project_in_voting_of_no_confidence =
          onChainProjectRes.projectInVotingOfNoConfidence;
        // project.milestones = onChainProjectRes.milestones

        await updateProject(project.id, newProject);
        setWait(false);
        setProject(newProject);
        setFirstPendingMilestone(firstPendingMilestoneChain);
        setProjectInMilestoneVoting(onChainProjectRes.projectInMilestoneVoting);
        setProjectInVotingOfNoConfidence(
          onChainProjectRes.projectInVotingOfNoConfidence
        );
      }
      // else {
      //   setProject(project);
      //   setFirstPendingMilestone(project.first_pending_milestone ?? -1);
      //   setProjectInMilestoneVoting(project.project_in_milestone_voting);
      //   setProjectInVotingOfNoConfidence(project?.project_in_voting_of_no_confidence ?? false);
      // }
    } catch (error) {
      console.error(error);
      setError({ message: 'Could not sync project. ', error });
    } finally {
      setMilestoneLoadingTitle('');
      setLoading(false);
    }
  };

  const refund = async (account: WalletAccount) => {
    if (!project?.id || !project.chain_project_id)
      return setError({
        message: 'No project found. Please try reloading the page',
      });

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
              await insertNoConfidenceVoter(project?.id, user);

              setSuccess(true);
              setSuccessTitle(
                'Your vote for refund was successful. Project has been refunded.'
              );
              break;
            } else if (noConfidencePoll == ImbueChainPollResult.EventFound) {
              await insertNoConfidenceVoter(project?.id, user);

              setSuccess(true);
              setSuccessTitle('Your vote for refund was successful');
              break;
            } else if (result.status) {
              setSuccess(true);
              setSuccessTitle('Request resolved successfully');
              break;
            } else if (result.txError) {
              setError({ message: result.errorMessage });
              break;
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
          if (
            result.status ||
            result.txError ||
            pollResult == ImbueChainPollResult.EventFound
          ) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              project.project_in_voting_of_no_confidence = true;
              await updateProject(project?.id, project);
              await insertNoConfidenceVoter(project?.id, user);
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
      setError({ message: 'Something went wrong. ', error });
    } finally {
      setLoading(false);
    }
  };

  console.log(project);
  console.log(projectOwner);

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
      <Modal open={true} className='flex justify-center items-center'>
        <VoteModal />
      </Modal>
      <div className='w-full grid grid-cols-12 bg-white py-5 px-7 rounded-2xl'>
        <p className='text-black col-start-1 col-end-10 '>
          {projectType} information
        </p>
        {/* starting of project section */}
        <div className=' border-inherit col-start-1 col-end-10 my-5 border rounded-xl py-4 px-5'>
          <div className='flex mb-4 items-center justify-between'>
            <p className='text-sm text-[#747474]'>Project Description</p>
            <p className='px-3 flex items-center  py-1.5 rounded-full border border-inherit text-sm text-black'>
              view full Description
              <TfiNewWindow className='ml-1.5 text-gray-500' size={14} />
            </p>
          </div>
          <h4 className='text-imbue-purple-dark text-2xl'>{project.name}</h4>
          <p className='text-black text-sm py-5'>{project.description}</p>

          <div className='flex mt-5 space-x-5'>
            <div className='bg-[#F2F0FF] justify-between py-2 px-4 flex flex-col  rounded-xl'>
              <p className='text-imbue-purple text-sm '>Posted</p>
              <p className='text-imbue-purple-dark text-sm'>{timePosted}</p>
            </div>
            <div className='bg-[#FFEBEA] flex flex-col justify-between rounded-xl space-y-3 py-2 px-2'>
              <div className='flex space-x-3 items-center'>
                <p className='text-sm text-[#8A5C5A]'>Shared by</p>
                <p className='px-2 flex text-sm items-center rounded-xl  py-1 bg-white text-black'>
                  <BsChatLeftDots
                    className='text-imbue-purple-dark mr-1'
                    size={16}
                  />
                  Chat
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <Image
                  src={projectOwner?.profile_photo || '/profile-image.png'}
                  width={30}
                  height={30}
                  alt='image'
                />
                <p className='text-imbue-coral'>{projectOwner?.display_name}</p>
              </div>
            </div>

            <div className=' bg-light-grey flex flex-col justify-between px-4 py-3 rounded-xl'>
              <div className='flex justify-between'>
                <p className='text-[#8A5C5A] text-sm'>Approvers</p>
                <p className='bg-white text-black px-2 py-1 rounded-full text-xs'>
                  see all
                </p>
              </div>
              <div className='mt-3'>
                <ProjectApprovers
                  {...{
                    approversPreview,
                    project,
                    setIsApprover,
                    setApproverPreview,
                    projectOwner,
                  }}
                />
              </div>
            </div>
          </div>
          {/* Ending of project section */}
        </div>
        {/* Starting of milestone section */}
        <div className='bg-light-grey col-start-1 col-end-10 text-[#747474] py-5 px-1 mt-10 rounded-xl'>
          <p className='text-[#747474] ml-6 text-sm'>Project Milestones</p>

          <div className='grid grid-cols-12 mt-16 ml-7'>
            <p className='ml-6 col-start-1 col-end-7 '>Title</p>
            <p className=' col-start-7 col-end-9 text-right mr-10 '>
              Milestone Funding
            </p>
            <p className=' col-start-9 col-end-11 '>Milestone ends</p>
            <p className=' col-start-11 col-end-13 text-left '>Stage</p>
          </div>
          {project?.milestones?.map((item: Milestone, index: number) => (
            <Accordion
              className='shadow-none mt-5 before:h-0 !rounded-xl py-5'
              key={'milestone' + index}
            >
              <AccordionSummary
                aria-controls='panel1a-content'
                id='panel1a-header'
              >
                <Typography className='grid grid-cols-12 w-full'>
                  <div className='col-start-1 col-end-7  flex items-center'>
                    <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                      <span className='relative text-sm z-10'>{index + 1}</span>
                      <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                    </div>
                    <p className='text-black ml-3 text-2xl'>{item.name}</p>
                  </div>
                  <p className='col-start-7 col-end-9 text-right mr-10'>
                    ${item.amount}
                  </p>
                  <p className='col-start-9 text-sm col-end-11 ml-2  '>
                    3rd November 2023
                  </p>

                  <p
                    className={classNames(
                      'px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ',
                      item.is_approved
                        ? 'bg-lime-100 text-lime-600'
                        : 'bg-red-100 text-red-500'
                    )}
                  >
                    {item.is_approved ? 'Completed' : 'open for voting'}
                  </p>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography className='px-2'>
                  <div>
                    <p className='text-black mt-10 font-semibold text-lg'>
                      Milestone description and expectation
                    </p>
                    <p className='mt-5'>{item.description}</p>
                    <p className='text-black mt-10 font-semibold text-lg'>
                      Deliverables and updates
                    </p>
                    <p className='mt-5'>
                      At this stage of this project, we were entirely focused on
                      pushing out our first MVP based on our product roadmap;
                      for this we would hired talents on imbue including a
                      designer, a UX writer, a Full Stack Developer and a
                      Project Manager. We estimated our MVP Design and
                      Development to involve Key steps, Hiring, Onboarding and
                      task delegation; and at the end of this Milestone we now
                      have a live Website for our Waitlist. You can find a link
                      to the live website <a href='#'>here</a>
                    </p>
                    <p className='text-black mt-10 font-semibold text-lg'>
                      Project Attachments
                    </p>
                    <div className='flex space-x-5'>
                      <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                        <div className='space-y-2'>
                          <p>Landing page Development files</p>
                          <p>3.2MB</p>
                        </div>
                        <LuTrash2 size={20} />
                      </div>
                      <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                        <div className='space-y-2'>
                          <p>Landing page Development files</p>
                          <p>3.2MB</p>
                        </div>
                        <LuTrash2 size={20} />
                      </div>
                      <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                        <div className='space-y-2'>
                          <p>Landing page Development files</p>
                          <p>3.2MB</p>
                        </div>
                        <LuTrash2 size={20} />
                      </div>
                    </div>
                    <div className='w-full mt-7 flex'>
                      <button
                        className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                        style={{ textAlign: 'center' }}
                      >
                        Vote for Milestone
                      </button>
                    </div>
                  </div>
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
        {/* Ending of milestone section */}
        {/* starting side bar for project details */}
        <div className='col-start-10 mx-10  row-start-1 row-end-4 col-end-13'>
          <div className='bg-light-grey mt-11 py-3 px-3 rounded-xl'>
            <p className='text-[#747474] text-sm mb-5'>Project Overview</p>
            <div className='space-y-2'>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Milestones</p>
                <div className='w-48  mt-6'>
                  <MilestoneProgressBar
                    currentValue={1}
                    titleArray={['1', '2', '3', '4']}
                  />
                </div>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Timeline</p>
                <p className='text-imbue-purple-dark text-xl mt-5'>3 Months</p>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Grant Wallet</p>
                <p className='text-imbue-purple-dark line-clamp-1  mt-5'>
                  {project?.escrow_address?.slice(0, 6) +
                    '...' +
                    project?.escrow_address?.substr(-3)}
                </p>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>Total Funding</p>
                <p className='text-imbue-purple-dark mt-5 text-xl '>
                  40,0000 KSM
                </p>
              </div>
              <div className='flex bg-white justify-between px-5 py-3 rounded-xl'>
                <p className='text-black mt-5'>On-Chain Project ID</p>
                <p className='text-imbue-purple-dark mt-5 text-xl '>
                  {project.chain_project_id}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* ending side bar for project details */}
        <div className='bg-white col-start-10  mx-10 row-start-3 mt-44 row-end-7 col-end-13 '>
          <div className='bg-white col-start-10 px-3 rounded-xl py-3 border border-light-grey'>
            <div className='flex justify-between text-black'>
              <p>Milestone Vote Results</p>
              <p>1/6</p>
            </div>
            <div className='bg-light-grey mt-5 py-7 rounded-xl px-3'>
              <div className='flex text-black items-center'>
                <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                  <span className='relative text-sm z-10'>{1}</span>
                  <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                </div>
                <p className='ml-2'>This is a milestone</p>
                <button className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto'>
                  Vote
                </button>
              </div>
              <div className='flex mt-7 justify-between'>
                <div>
                  <div className='img-section flex'>
                    <Image
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                    <Image
                      className='-ml-1'
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                  </div>
                  <p className='text-black text-sm'>
                    No <span className='text-gray-400'>(1 votes/5%)</span>
                  </p>
                </div>
                <div>
                  <div className='img-section flex justify-end'>
                    <Image
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                    <Image
                      className='-ml-1'
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                    <Image
                      className='-ml-1'
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                    <Image
                      className='-ml-1'
                      src={'/profile-image.png'}
                      width={20}
                      height={20}
                      alt='team'
                    />
                  </div>
                  <p className='text-black text-sm'>
                    <span className='text-gray-400'>(12 Votes/95%)</span>Yes
                  </p>
                </div>
              </div>
              <div className='flex w-full relative mt-5'>
                <LinearProgress
                  className='w-[50%] text-imbue-coral rotate-180 before:bg-[#DDDCD6]    h-5 rounded-full'
                  color='inherit'
                  variant='determinate'
                  value={20}
                />
                <div className='w-3 left-[47%] top-[20%] absolute z-10 bg-[#DDDCD6] rounded-full h-3'></div>
                <LinearProgress
                  className='w-[50%] h-5 -ml-3 rounded-full bg-[#DDDCD6]'
                  variant='determinate'
                  value={90}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
