/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { WalletAccount } from '@talismn/connect-wallets';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import * as utils from '@/utils';
import { getBalance } from '@/utils/helper';
import { initImbueAPIInfo } from '@/utils/polkadot';

import AccountChoice from '@/components/AccountChoice';
import ChatPopup from '@/components/ChatPopup';
import { Dialogue } from '@/components/Dialogue';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import Login from '@/components/Login';
import SuccessScreen from '@/components/SuccessScreen';
import WaitingScreen from '@/components/WaitingScreen';

import { calenderIcon, shieldIcon, tagIcon } from '@/assets/svgs';
import { timeData } from '@/config/briefs-data';
import {
  Currency,
  Milestone,
  OffchainProjectState,
  OnchainProjectState,
  Project,
  ProjectOnChain,
} from '@/model';
import { getBrief, getProjectById } from '@/redux/services/briefService';
import ChainService from '@/redux/services/chainService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
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

const openForVotingTag = (): JSX.Element => {
  return (
    <div className='flex flex-row items-center'>
      <div className='h-[15px] w-[15px] rounded-[7.5px] bg-[#BAFF36]' />
      <p className='text-xl font-normal leading-[23px] text-[#BAFF36] mr-[27px] ml-[14px]'>
        Open for Voting
      </p>
    </div>
  );
};

const projectStateTag = (dateCreated: Date, text: string): JSX.Element => {
  return (
    <div className='flex flex-row items-center'>
      <p className='text-sm font-normal leading-[16px] text-white'>
        {moment(dateCreated)?.format('DD MMM YYYY')}
      </p>
      <p className='text-sm lg:text-xl font-normal leading-[23px] text-[#411DC9] mr-[27px] ml-[14px]'>
        {text}
      </p>
    </div>
  );
};

function Project() {
  const router = useRouter();
  const [project, setProject] = useState<Project | any>({});
  const [targetUser, setTargetUser] = useState<any>({});
  const [onChainProject, setOnChainProject] = useState<ProjectOnChain | any>();
  // const [user, setUser] = useState<User | any>();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [submittingMilestone, setSubmittingMilestone] =
    useState<boolean>(false);
  const [raiseVoteOfNoConfidence, setRaiseVoteOfNoConfidence] = useState<boolean>(false);
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
  const [milestoneBeingVotedOn, setMilestoneBeingVotedOn] = useState<number>();
  const [isApplicant, setIsApplicant] = useState<boolean>();
  const [showRefundButton] = useState<boolean>();

  const [wait, setWait] = useState<boolean>(false);
  const [waitMessage, setWaitMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [error, setError] = useState<any>();
  const [balance, setBalance] = useState<any>(0);
  const [approversPreview, setApproverPreview] = useState<any>([]);

  // fetching the project data from api and from chain
  useEffect(() => {
    if (projectId && !userLoading) {
      getProject();
    }
  }, [projectId, userLoading]);

  const getChainProject = async (project: Project, freelancer: any) => {
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    const onChainProjectRes = await chainService.getProject(projectId);

    if (onChainProjectRes) {
      const isApplicant = onChainProjectRes.initiator == user.web3_address;
      setIsApplicant(isApplicant);
      // TODO Enable refunds first
      //setShowRefundButton(onChainProjectRes.fundingType.Grant)
      if (onChainProjectRes.projectState == OnchainProjectState.OpenForVoting) {
        const firstPendingMilestone =
          await chainService.findFirstPendingMilestone(
            onChainProjectRes.milestones
          );
        setMilestoneBeingVotedOn(firstPendingMilestone);
      }

      setOnChainProject(onChainProjectRes);
    } else {
      switch (project.status_id) {
        case OffchainProjectState.PendingReview:
          setWaitMessage("This project is pending review");
          break;
        case OffchainProjectState.ChangesRequested:
          setWaitMessage("Changes have been requested");
          break;
        case OffchainProjectState.Accepted:
          if (!project.chain_project_id) {
            setWaitMessage(`Waiting for ${freelancer.display_name} to start the work`);
          } else {
            setWaitMessage(`Your project is being created on the chain. This may take up to 6 seconds`);
          }
          break;
      }
      setWait(true)
    }
  };

  const getProject = async () => {
    try {
      const projectRes = await getProjectById(projectId);
      // showing owner profile if the current user if the applicant freelancer
      const brief = await getBrief(projectRes.brief_id);
      const owner = brief?.user_id
        ? await utils.fetchUser(brief?.user_id)
        : null;

      const freelancerRes = await getFreelancerProfile(projectRes?.user_id);
      if (projectRes?.user_id == user?.id) {
        setTargetUser(owner);
      } else {
        setTargetUser(freelancerRes);
      }
      setProject(projectRes);
      // setting approver list
      const approversPreviewList = [...approversPreview];

      if (projectRes?.approvers?.length && approversPreviewList.length === 0) {
        projectRes?.approvers.map(async (approverAddress: any) => {
          const approver = await utils.fetchUserByUsernameOrAddress(approverAddress);
          if (approver?.length) {
            approversPreviewList.push(...approver);
          } else {
            approversPreviewList.push({
              // id: 6,
              display_name: '',
              profile_photo: null,
              username: '',
              web3_address: approverAddress,
            });
          }
        });
      } else {
        approversPreviewList.push({
          // id: 6,
          display_name: owner?.display_name,
          profile_photo: owner?.profile_photo,
          username: owner?.username,
          web3_address: owner?.web3_address,
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

      setBalance(balance || 0);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // voting on a mile stone
  const voteOnMilestone = async (account: WalletAccount, vote: boolean) => {
    setLoading(true);
    try {
      const imbueApi = await initImbueAPIInfo();
      // const userRes: User | any = await utils.getCurrentUser();
      const chainService = new ChainService(imbueApi, user);
      await chainService.voteOnMilestone(
        account,
        onChainProject,
        milestoneKeyInView,
        vote
      );
      setSuccess(true);
      setSuccessTitle('Your vote was successfull');
    } catch (error) {
      setError({ message: 'Could not vote. Please try again later' });
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

  // submitting a milestone
  const withdraw = async (account: WalletAccount) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    // const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const result = await chainService.withdraw(account, onChainProject);
    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
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
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    // const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const result = await chainService.raiseVoteOfNoConfidence(account, onChainProject);
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
    setLoading(false);  };

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
      closeDialouge={() => setShowVotingModal(false)}
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

  const approvedMilestones = project?.milestones?.filter?.(
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
      <div className='mt-8 relative bg-white px-5 border border-white rounded-2xl lg:px-12 max-width-750px:!pb-[30px]'>
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
          max-width-750px:flex'
        >
          <div className='flex flex-row max-width-750px:w-full'>
            <h3 className='text-[2rem] text-imbue-purple max-width-750px:text-[24px] font-normal leading-[60px]'>
              Milestone {index + 1}
            </h3>
            <h3 className='text-[1.5rem] text-imbue-purple ml-[32px] font-normal leading-[60px]'>
              {milestone?.name}
            </h3>
          </div>
          <div className='flex flex-row items-center max-width-750px:w-full max-width-750px:justify-between'>
            {milestone?.is_approved
              ? projectStateTag(modified, 'Completed')
              : milestone?.milestone_key == milestoneBeingVotedOn
                ? openForVotingTag()
                : projectStateTag(modified, 'Not Started')}

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

          <p className=' text-base font-normal text-[#3B27C180] leading-[178.15%] mt-[23px] w-[80%]'>
            {milestone?.description}
          </p>

          {!isApplicant && milestone.milestone_key == milestoneBeingVotedOn && (
            <button
              className='primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[2.6rem] items-center content-center !py-0 mt-[25px] px-8'
              data-testid='next-button'
              onClick={() => vote()}
            >
              Vote
            </button>
          )}

          {isApplicant &&
            onChainProject?.projectState !==
            OnchainProjectState.OpenForVoting && (
              <button
                className='primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8'
                data-testid='next-button'
                onClick={() => submitMilestone()}
              >
                Submit
              </button>
            )}

          {isApplicant && milestone.is_approved && (
            <button
              className='primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8'
              data-testid='next-button'
              onClick={() => withdraw()}
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='max-lg:p-[var(--hq-layout-padding)]'>
      {loading && <FullScreenLoader />}
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
      <div
        className='flex 
      flex-row
       bg-white 
       rounded-[20px] 
       p-12
       max-lg:p-5
       max-lg:flex-col
       '
      >
        <div className='flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] max-lg:basis-[60%] mr-[5%]  max-lg:mr-0'>
          <div className='flex flex-wrap lg:gap-4 lg:items-center'>
            <h3 className='text-[2rem] max-lg:text-[24px] leading-[1.5] font-normal m-0 p-0 text-imbue-purple'>
              {project?.name}
            </h3>
            {project?.brief_id && (
              <span
                onClick={() => {
                  // TODO:
                }}
                className=' text-imbue-lemon cursor-pointer text-base max-lg:text-base font-normal !m-0 !p-0'
              >
                {`View full brief`}
              </span>
            )}
          </div>
          <div className='text-inactive lg:w-[80%]'>
            <p className='text-[1rem] text-content font-normal leading-[178.15%]'>
              {project?.description}
            </p>
          </div>
          <p className='text-sm text-content-primary leading-[1.5] m-0 p-0'>
            Posted {timePosted}
          </p>

          <p className='text-imbue-purple text-[1.25rem] font-normal leading-[1.5] mt-[16px] p-0'>
            {isApplicant || project?.approvers?.length
              ? 'Project Owner'
              : 'Freelancer hired'}
          </p>

          <div className='flex flex-row items-center max-lg:flex-wrap'>
            <Image
              src={
                targetUser?.profile_image ||
                targetUser?.profile_photo ||
                require('@/assets/images/profile-image.png')
              }
              alt='freelaner-icon'
              height={50}
              width={50}
              className='rounded-full'
            />

            <p className='text-imbue-purple text-[1.25rem] font-normal leading-[1.5] p-0 mx-7'>
              {targetUser?.display_name}
            </p>

            {(targetUser?.id && targetUser?.id !== user?.id) && (
              <button
                onClick={() => setShowMessageBox(true)}
                className='primary-btn 
        in-dark w-button 
        !mt-0 
        font-normal 
        max-lg:!w-full 
        max-lg:!text-center 
        max-lg:!ml-0 
        max-lg:!mt-5 
        items-center 
        content-center 
        !py-0 ml-[40px] 
        px-8
        max-lg:!mr-0
        h-[2.6rem]
        '
                data-testid='next-button'
              >
                Message
              </button>

            )}


            {showRefundButton && (
              <button
                className='border border-imbue-purple-dark px-6 h-[2.6rem] rounded-full hover:bg-white text-imbue-purple-dark transition-colors'
                onClick={async () => {
                  // set submitting mile stone to true
                  await setRaiseVoteOfNoConfidence(true);
                  // show polkadot account modal
                  await setShowPolkadotAccounts(true);
                }}
              >
                Refund
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
                      className='flex text-content gap-3 items-center border border-content-primary p-3 rounded-full'
                    >
                      <Image
                        height={40}
                        width={40}
                        src={
                          approver?.profile_photo ??
                          'http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png'
                        }
                        alt=''
                        className='rounded-full'
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
        <div className='flex flex-col gap-[30px] max-lg:mt-10 lg:w-56'>
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
                  <span className='text-imbue-purple-dark  ml-2'>
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
                    className='h-full rounded-xl Accepted-button absolute'
                  ></div>
                  <div className='flex justify-evenly'>
                    {onChainProject?.milestones?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`h-4 w-4 ${m.is_approved ? 'Accepted-button' : 'bg-[#E1DDFF]'
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
                  {Number(project?.total_cost_without_fee)?.toLocaleString()}{' '}
                  ${Currency[project?.currency_id || 0]}
                </h3>
                <div className='text-[1rem] text-imbue-light-purple-two mt-2'>
                  Budget - Fixed
                </div>
              </div>
            </div>
          </div>

          {project?.escrow_address && (
            <div className='flex flex-col'>
              <div className='flex flex-row items-start gap-3'>
                <AccountBalanceWalletOutlinedIcon className='mt-1 text-imbue-purple-dark' />
                <div className='flex flex-col'>
                  <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
                    Wallet Address
                  </h3>
                  <div className='text-[1rem] text-imbue-light-purple-two mt-2 text-xs break-all'>
                    {project?.escrow_address}
                  </div>
                  <div className='text-[1rem] text-imbue-light-purple-two mt-2'>
                    balance : {balance} ${Currency[project?.currency_id] }
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </div>
      </div>

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
            onClick={() => setSuccess(false)}
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

      <WaitingScreen title={waitMessage}
        open={wait}
        setOpen={setWait}>
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
    </div>
  );
}

export default Project;

