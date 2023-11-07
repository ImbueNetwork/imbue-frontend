import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Button, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { WalletAccount } from '@talismn/connect-wallets';
import axios from 'axios';
import moment from 'moment';
import Image from 'next/image';
import React, { useState } from 'react';

import { sendNotification } from '@/utils';
import { initImbueAPIInfo } from '@/utils/polkadot';

import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';
import VoteModal from '@/components/ReviewModal/VoteModal';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { Milestone, OffchainProjectState, Project, User } from '@/model';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';
import {
  uploadMilestoneAttachments,
  watchChain,
  withdrawOffchain,
} from '@/redux/services/projectServices';
import { updateProject } from '@/redux/services/projectServices';

interface ExpandableMilestonProps {
  item: Milestone;
  index: number;
  project: Project;
  isApplicant: boolean;
  projectType: 'grant' | 'brief' | null;
  isProjectOwner: boolean;
  setLoading: (_value: boolean) => void;
  setSuccess: (_value: boolean) => void;
  setSuccessTitle: (_value: string) => void;
  setError: (_value: any) => void;
  user: User;
  setShowPolkadotAccounts: (_value: boolean) => void;
  canVote: boolean;
  loading: boolean;
  targetUser: any;
  balance: number;
  balanceLoading: boolean;
  // hasMilestoneAttachments: boolean;
}

const ExpandableMilestone = (props: ExpandableMilestonProps) => {
  const {
    index,
    item: milestone,
    project,
    isApplicant,
    projectType,
    isProjectOwner,
    setError,
    user,
    setSuccessTitle,
    setSuccess,
    targetUser,
    balance,
    balanceLoading,
    // hasMilestoneAttachments = false
  } = props;
  const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);
  const [submittingMilestone, setSubmittingMilestone] =
    useState<boolean>(false);
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [withdrawMilestone, setWithdrawMilestone] = useState<boolean>(false);
  const [votingWalletAccount, setVotingWalletAccount] = useState<
    WalletAccount | any
  >({});
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const showVoteButton =
    user?.id &&
    !isApplicant &&
    project.first_pending_milestone === milestone.milestone_index &&
    project.project_in_milestone_voting;

  const showSubmitButton =
    (isApplicant || (projectType === 'grant' && isProjectOwner)) &&
    milestone.milestone_index == project.first_pending_milestone &&
    !project.project_in_milestone_voting &&
    !milestone?.is_approved;

  // const [attachments, setAttachment] = useState<any>([]);

  // useEffect(() => {
  //   const getAttachments = async () => {
  //     if (!project?.id || milestone?.milestone_index === undefined) return;

  //     const resp = await getMilestoneAttachments(
  //       project.id,
  //       milestone.milestone_index
  //     );
  //     setAttachment(resp);
  //   };

  //   if(hasMilestoneAttachments){ 
  //     getAttachments();
  //   }
  // }, [milestone.milestone_index, project.id]);

  const [files, setFiles] = useState<File[]>();

  const handleUpload = async (): Promise<string[]> => {
    if (!files?.length) return [];

    const data = new FormData();

    files.forEach((file) => {
      data.append(`files`, file);
    });

    try {
      const { data: fileURLs } = await axios.post(`/api/upload`, data);
      return fileURLs.url as string[];
    } catch (error) {
      return [];
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files?.length) {
      const fileArray = Array.from(files);
      setFiles(fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (!files?.length) return;

    const prevFiles = [...files];
    prevFiles?.splice(index, 1);

    setFiles(prevFiles);
  };

  // submitting a milestone
  const submitMilestone = async (account: WalletAccount) => {
    if (!project?.chain_project_id || !project.id)
      return setError({ message: 'No project found' });

    setLoading(true);

    const fileURLs = await handleUpload();

    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      const result = await chainService.submitMilestone(
        account,
        project.chain_project_id,
        milestoneKeyInView
      );

      watchChain(ImbueChainEvent.SubmitMilestone, account.address, project.id);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            // if (fileURLs?.length) {
            //   await uploadMilestoneAttachments(project.id, milestone.milestone_index, fileURLs)
            // }
            // const resp = await updateProjectVotingState(Number(project.id), true)
            const resp = await uploadMilestoneAttachments(
              project.id,
              milestone.milestone_index,
              fileURLs
            );

            if (resp) {
              await sendNotification(
                projectType === 'brief'
                  ? [String(targetUser.id)]
                  : project.approvers,
                'submit_Milestone.testing',
                'A New Milestone has been made',
                `Milestone Submitted Successfully`,
                Number(project.id),
                milestone.milestone_index + 1
              );
              setSuccess(true);
              setSuccessTitle('Milestone Submitted Successfully');
            } else {
              setError({
                message:
                  'Server error. Could not update project voting status.',
              });
            }
          } else if (result.txError) {
            setError({ message: result.errorMessage });
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } catch (error: any) {
      setError({ message: `Internal server error. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMilestone = (milestone_index: number) => {
    // show polkadot account modal
    setShowPolkadotAccounts(true);
    // set submitting mile stone to false
    setSubmittingMilestone(true);
    // setMile stone key in view
    setMilestoneKeyInView(milestone_index);
  };

  // voting on a mile stone
  const handleVoting = (milestone_index: number) => {
    // show polkadot account modal
    setShowPolkadotAccounts(true);
    // set submitting mile stone to false
    setSubmittingMilestone(false);
    // setMile stone key in view
    setMilestoneKeyInView(milestone_index);
  };

  // voting on a mile stone
  const handleWithdraw = (milestone_index: number) => {
    // set submitting mile stone to true
    setWithdrawMilestone(true);
    // show polkadot account modal
    setShowPolkadotAccounts(true);
    // setMile stone key in view
    setMilestoneKeyInView(milestone_index);
  };

  // withdrawing funds
  const withdraw = async (account: WalletAccount) => {
    if (!project.id)
      return
    setLoading(true);

    try {
      const projectMilestones = project.milestones;
      // const user: User | any = await utils.getCurrentUser();
      const approvedMilestones = project.milestones.filter((milestone: Milestone) => milestone.is_approved).map(milestone => milestone.milestone_index);
      const withdrawnMilestones = project.milestones.filter((milestone: Milestone) => milestone.withdrawn_onchain).map(milestone => milestone.milestone_index);
      const onChainWithdrawalRequired = JSON.stringify(approvedMilestones) != JSON.stringify(withdrawnMilestones);
      watchChain(ImbueChainEvent.Withraw, account.address, project.id);

      if (onChainWithdrawalRequired) {
        const imbueApi = await initImbueAPIInfo();
        const chainService = new ChainService(imbueApi, user);
        const result = await chainService.withdraw(
          account,
          project.chain_project_id
        );

        while (onChainWithdrawalRequired) {
          if (result.status || result.txError) {
            if (result.status) {
              const haveAllMilestonesBeenApproved = projectMilestones
                .map((m: any) => m.is_approved)
                .every(Boolean);

              if (haveAllMilestonesBeenApproved) {
                project.status_id = OffchainProjectState.Completed;
                project.completed = true;
                await updateProject(Number(project?.id), project);
              }

              if (project.currency_id < 100) {
                setSuccess(true);
                setSuccessTitle('Withdraw successful');
              }


            } else if (result.txError) {
              // setLoading(false);
              setError({ message: 'Error : ' + result.errorMessage });
            }
            break;
          }
          await new Promise((f) => setTimeout(f, 1000));
        }

      }

      if (project.currency_id >= 100 && project.id) {
        const withdrawResult = await withdrawOffchain(project.id);
        if (withdrawResult.txError) {
          setSuccess(false);
          setError({ message: withdrawResult.errorMessage });
        } else if(Number(withdrawResult.withdrawn) > 0) {
          setSuccess(true);
          setSuccessTitle('Withdraw successful');
        }
        setLoading(false);
      }

    } catch (error) {
      setError({ message: 'Error' + error });
    }
  };

  return (
    <>
      {showPolkadotAccounts && (
        <Web3WalletModal
          accountSelected={async (account: WalletAccount) => {
            if (submittingMilestone) {
              submitMilestone(account);
              // }
              // else if (raiseVoteOfNoConfidence) {
              //     refund(account);
            } else if (withdrawMilestone) {
              withdraw(account);
            } else {
              setVotingWalletAccount(account);
              setShowVotingModal(true);
            }

            setShowPolkadotAccounts(false);
          }}
          polkadotAccountsVisible={showPolkadotAccounts}
          showPolkadotAccounts={setShowPolkadotAccounts}
        // initiatorAddress={project?.owner}
        // filterByInitiator
        />
      )}

      <VoteModal
        {...{
          setSuccessTitle,
          setSuccess,
          setError,
          milestoneKeyInView,
          targetUser,
        }}
        visible={showVotingModal}
        setVisible={setShowVotingModal}
        setLoading={setLoading}
        user={user}
        project={project}
        votingWalletAccount={votingWalletAccount}
        projectType={projectType}
      />

      <Accordion className='shadow-none mt-5 before:h-0 !rounded-xl py-5'>
        <AccordionSummary aria-controls='panel1a-content' id='panel1a-header'>
          <Typography className='grid grid-cols-12 gap-5 w-full'>
            <div className='col-start-1 col-end-7  flex items-center'>
              <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                <span className='relative text-sm z-10'>{index + 1}</span>
                <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
              </div>
              <p className='text-black ml-3 text-2xl break-words w-11/12'>
                {milestone?.name}
              </p>
            </div>
            <p className='col-start-7 col-end-9 text-lg mr-10 ml-4'>
              ${milestone.amount}
            </p>
            <p className='col-start-9 text-lg col-end-11 ml-4'>
              {moment(milestone.modified).format('MMM Do YY')}
            </p>

            {/* <p
                        className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${item.is_approved
                            ? 'bg-lime-100 text-lime-600'
                            : 'bg-red-100 text-red-500'}`}
                    >
                        {item.is_approved ? 'Completed' : 'Open for voting'}
                    </p> */}
            {project.first_pending_milestone === milestone.milestone_index &&
              project.project_in_milestone_voting ? (
              <p
                className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto h-fit ${milestone.is_approved
                  ? 'bg-lime-100 text-lime-600'
                  : 'bg-red-100 text-red-500'
                  }`}
              >
                {milestone.is_approved ? 'Completed' : 'Open for voting'}
              </p>
            ) : (
              <p
                className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto h-fit ${milestone.is_approved
                  ? 'bg-lime-100 text-lime-600'
                  : 'bg-[#EBEAE2] text-[#949494]'
                  }`}
              >
                {milestone.is_approved ? 'Completed' : 'Pending'}
              </p>
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className='px-2'>
            <div>
              <p className='text-black mt-10 font-semibold text-lg'>
                Milestone description and expectation
              </p>
              <p className='mt-5 whitespace-pre-wrap break-words'>
                {milestone.description}
              </p>
              {milestone.attachments?.length ? (
                <div>
                  <p className='text-black mt-10 font-semibold text-lg'>
                    Project Attachments
                  </p>
                  <div className='grid grid-cols-6 gap-3'>
                    {milestone.attachments?.length
                      ? milestone.attachments.map((attachment: any, index: number) => (
                        <a
                          className='col-span-1'
                          key={index}
                          href={attachment.fileURL}
                          target='_blank'
                        >
                          <div className='border rounded-lg mt-5 px-3 text-xs py-3'>
                            <div className='space-y-2'>
                              <p>
                                {attachment.fileURL?.split('$')[1] ||
                                  'Attachment'}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))
                      : ''}
                  </div>
                </div>
              ) : (
                ''
              )}

              {showSubmitButton && (
                <div>
                  <p className='text-black mt-10 font-semibold text-lg'>
                    Add Attachments for this project
                  </p>
                  <div className='flex space-x-5'>
                    {files?.length
                      ? files.map((file, index) => (
                        <div
                          key={index}
                          className='border rounded-lg mt-5 flex space-x-4 items-center px-3 text-xs py-3'
                        >
                          <div className='space-y-2'>
                            <p>{file.name}</p>
                            <p>{(file.size / 1048576).toFixed(2)} MB</p>
                          </div>
                          <Image
                            className='cursor-pointer ml-2'
                            src={require('@/assets/svgs/trash.svg')}
                            alt=''
                            onClick={() => handleRemoveFile(index)}
                          />
                        </div>
                      ))
                      : ''}
                  </div>

                  <Button
                    component='label'
                    variant='contained'
                    startIcon={<CloudUploadIcon />}
                    color='secondary'
                    className='mt-5'
                  >
                    Upload file
                    <input
                      className='hidden'
                      type='file'
                      multiple
                      onChange={(e) => handleFileSelect(e)}
                    />
                  </Button>
                </div>
              )}

              <div className='w-full mt-7'>
                {!props?.loading && showVoteButton && (
                  <Tooltip
                    followCursor
                    title={
                      !props?.canVote &&
                      `Only approvers are allowed to vote on a milestone and you cannot vote more than once.${user.web3_address &&
                      `You are currently on wallet: ${user.web3_address}`
                      }`
                    }
                  >
                    <button
                      className={`primary-btn  ml-auto in-dark w-button lg:w-1/5 text-center ${!props?.canVote && '!bg-gray-300 !text-gray-400'
                        }`}
                      onClick={() =>
                        props?.canVote &&
                        handleVoting(milestone.milestone_index)
                      }
                    >
                      Vote for Milestone
                    </button>
                  </Tooltip>
                )}

                {
                  showSubmitButton && (
                    <div>
                      <div className='w-full flex'>
                        <button
                          className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                          style={{ textAlign: 'center' }}
                          onClick={() =>
                            handleSubmitMilestone(milestone.milestone_index)
                          }
                        >
                          Submit Milestone
                        </button>
                      </div>


                      {
                        balance === 0 && !balanceLoading && project?.brief_id && (
                          <div className='lg:flex gap-1 lg:items-center rounded-2xl bg-imbue-coral px-3 py-1 text-sm text-white w-fit ml-auto mt-3 '>
                            <ErrorOutlineOutlinedIcon className='h-4 w-4 inline' />
                            <p className='inline'>
                              No funds have been deposited to the escrow address. If you still want to submit your work the risks are upto you.
                            </p>
                          </div>
                        )
                      }
                    </div>

                  )
                }

                {isApplicant && milestone.is_approved && (
                  <button
                    className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                    style={{ textAlign: 'center' }}
                    onClick={() => handleWithdraw(milestone.milestone_index)}
                  >
                    Withdraw
                  </button>
                )}
              </div>

              <BackDropLoader open={loading} />
            </div>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ExpandableMilestone;
