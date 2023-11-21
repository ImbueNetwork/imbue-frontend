import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
} from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useState } from 'react';
import { BiArrowBack } from 'react-icons/bi';

import { sendNotification } from '@/utils';
import { initImbueAPIInfo } from '@/utils/polkadot';

import {
  ImbueChainPollResult,
  OffchainProjectState,
  Project,
  User,
} from '@/model';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';
import {
  insertNoConfidenceVote,
  updateProject,
  voteOnMilestone,
  watchChain,
} from '@/redux/services/projectServices';

import ReviewModal from './ReviewModal';
import SuccessModal from './SuccessModal';
import RefundModal from '../RefundModal/RefundModal';
import SuccessRefundModal from '../RefundModal/SuccessRefundModal';

interface VotingModalProps {
  refundOnly?: boolean;
  visible: boolean;
  setVisible: (_visible: boolean) => void;
  setLoading: (_visible: boolean) => void;
  project: Project;
  user: User;
  votingWalletAccount: WalletAccount | any;
  setError: (_value: any) => void;
  targetUser?: any;
  projectType?: 'grant' | 'brief' | null;
  approversPreview?: User[];
}

export default function VoteModal({
  targetUser,
  visible,
  setVisible,
  setLoading,
  project,
  user,
  votingWalletAccount,
  setError,
  refundOnly = false,
  projectType,
  approversPreview
}: VotingModalProps) {
  const [vote, setVote] = useState<boolean>(true);
  const [voteRefund, setVoteRefund] = useState<boolean | undefined>();
  const [step, setStep] = useState<number>(0);

  const handleVoteOnMilestone = async (vote: boolean) => {
    const milestoneKeyInView = project?.first_pending_milestone;
    if (!project?.id || !user.web3_address || milestoneKeyInView === undefined)
      return;

    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      watchChain(ImbueChainEvent.ApproveMilestone, votingWalletAccount.address, project.id, milestoneKeyInView);
      const result = await chainService.voteOnMilestone(
        votingWalletAccount,
        project.chain_project_id,
        milestoneKeyInView,
        vote
      );

      if (result.txError) {
        setError({ message: result.errorMessage });
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (result.status) {
          const resp = await voteOnMilestone(
            user.id,
            user.web3_address,
            milestoneKeyInView,
            vote,
            project.id
          );
          if (resp.milestoneApproved && targetUser?.id) {
            await sendNotification(
              [
                String(
                  projectType === 'brief' ? targetUser.user_id : targetUser.id
                ),
              ],
              'approved_Milestone.testing',
              'A Milestone has been approved',
              `${project.milestones[project.first_pending_milestone || 0].name
              } , a milestone on ${user.display_name}'s ${project.name
              } just got marked as approved`,
              Number(project.id),
              Number(project.first_pending_milestone) + 1
            );
          }

          setStep(4);
          setVisible(true);
          break;
        } else if (result.txError) {
          setError({ message: result.errorMessage });
          setVisible(false);
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } catch (error) {
      setError({ message: 'Could not vote. Please try again later' });
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const refund = async (vote: boolean) => {
    if (!project?.id || !project.chain_project_id)
      return setError({
        message: 'No project found. Please try reloading the page',
      });

    // TODO make this a popup value like vote on milestone
    // const vote = false;
    setLoading(true);

    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      let pollResult = ImbueChainPollResult.Pending;
      let noConfidencePoll = ImbueChainPollResult.Pending;

      const voteData = {
        voter: user,
        vote
      }

      if (project.project_in_voting_of_no_confidence) {
        const result = await chainService.voteOnNoConfidence(
          votingWalletAccount,
          project.chain_project_id,
          vote
        );

        if (!result.txError) {
          pollResult = (await chainService.pollChainMessage(
            ImbueChainEvent.NoConfidenceRoundFinalised,
            votingWalletAccount.address
          )) as ImbueChainPollResult;
          noConfidencePoll = (await chainService.pollChainMessage(
            ImbueChainEvent.VoteOnNoConfidenceRound,
            votingWalletAccount.address
          )) as ImbueChainPollResult;
        }

        while (true) {
          if (result.status || result.txError) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              project.status_id = OffchainProjectState.Refunded;
              await insertNoConfidenceVote(project?.id, voteData);
              await updateProject(project?.id, project);

              if (approversPreview?.length)
                sendNotification(
                  [...approversPreview.map(a => String(a.id)), String(project.user_id)],
                  'refund.complete',
                  'Refund Completed',
                  `The project ID: ${project.chain_project_id} has been officially refunded. If you encounter any issues or have further concerns, please utilise the report feature for assistance.`,
                  Number(project.id),
                  Number(project.first_pending_milestone) + 1
                );

              setVisible(true);
              setVoteRefund(vote);
              setStep(4);
              break;
            } else if (noConfidencePoll == ImbueChainPollResult.EventFound) {
              await insertNoConfidenceVote(project?.id, voteData);

              setVisible(true);
              setVoteRefund(vote);
              setStep(4);
              break;
            } else if (result.status) {
              await insertNoConfidenceVote(project?.id, voteData);

              setVisible(true);
              setStep(4);
              setVoteRefund(vote);
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
          votingWalletAccount,
          project.chain_project_id
        );

        if (!result.txError) {
          pollResult = (await chainService.pollChainMessage(
            ImbueChainEvent.RaiseNoConfidenceRound,
            votingWalletAccount.address
          )) as ImbueChainPollResult;
        }

        while (true) {
          if (
            result.status ||
            result.txError ||
            pollResult == ImbueChainPollResult.EventFound
          ) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              // project.project_in_voting_of_no_confidence = true;
              await updateProject(project?.id, { ...project, project_in_voting_of_no_confidence: true });
              await insertNoConfidenceVote(project?.id, voteData);

              // notification to voters for knowing refund initialed
              if (approversPreview?.length)
                sendNotification(
                  approversPreview.filter(a => a.id !== user.id)?.map(a => String(a.id)),
                  'refund.initiated',
                  'Refund has been initiated for a grant',
                  `One of your fellow grant voters initiated refund for project ID: ${project.chain_project_id}.. Please add your vote on refunding the project`,
                  Number(project.id),
                  Number(project.first_pending_milestone) + 1
                );

              // notification to grant owner for knowing refund initialed
              sendNotification(
                [String(project.user_id)],
                'refund.initiated',
                'Refund has been initiated for your grant',
                `The client is requesting a refund due to their dissatisfaction with your work. Please review the project ID: ${project.chain_project_id}. for more details.`,
                Number(project.id),
                Number(project.first_pending_milestone) + 1
              );

              setStep(4);
              setVoteRefund(vote);
              setVisible(true);
            } else if (result.status) {
              // project.project_in_voting_of_no_confidence = true;
              await updateProject(project?.id, { ...project, project_in_voting_of_no_confidence: true });
              await insertNoConfidenceVote(project?.id, voteData);

              // notification to voters for knowing refund initialed
              if (approversPreview?.length)
                sendNotification(
                  approversPreview.filter(a => a.id !== user.id)?.map(a => String(a.id)),
                  'refund.initiated',
                  'Refund has been initiated for a grant',
                  `One of your fellow grant voters initiated refund for project ID: ${project.chain_project_id}. Please add your vote on refunding the project`,
                  Number(project.id),
                  Number(project.first_pending_milestone) + 1
                );

              // notification to grant owner for knowing refund initialed
              sendNotification(
                [String(project.user_id)],
                'refund.initiated',
                'Refund has been initiated for your grant',
                `The client is requesting a refund due to their dissatisfaction with your work. Please review the project ID: ${project.chain_project_id}. for more details.`,
                Number(project.id),
                Number(project.first_pending_milestone) + 1
              );

              setStep(4);
              setVoteRefund(vote);
              setVisible(true);
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


  const handleVote = async () => {
    if (project?.brief_id) {
      setLoading(true);
      setVisible(false);
      await handleVoteOnMilestone(vote);
      setLoading(false);
    } else {
      if (vote) {
        setLoading(true);
        setVisible(false);
        await handleVoteOnMilestone(vote);
        setLoading(false);
      } else {
        setStep(2);
      }
    }
  };

  return (
    <Modal
      open={visible}
      className='flex justify-center items-center'
      onClose={() => {
        setVisible(false);
      }}
    >
      <div className='bg-white rounded-xl px-12 py-5 relative'>
        <div className='flex w-full justify-between px-5'>
          {step > 0 && step !== 4 && (
            <ArrowBackIcon
              className='h-7 w-7 hover:bg-imbue-purple rounded-full hover:text-white cursor-pointer border absolute left-5'
              color='secondary'
              onClick={() => setStep((prev) => prev - 1)}
            />
          )}

          {step !== 4 && (
            <CloseIcon
              className='h-7 w-7 hover:bg-imbue-purple rounded-full hover:text-white cursor-pointer border p-1 absolute right-5'
              color='secondary'
              onClick={() => setVisible(false)}
            />
          )}
        </div>
        {step === 0 && !refundOnly && (
          <ReviewModal
            {...{
              setStep,
              setVisible,
            }}
          />
        )}
        {step === 1 && (
          <div className='justify-center max-w-[31.938rem] text-center rounded-[18px]'>
            <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
              <Image
                src={'/confirm-icon.svg'}
                width={70}
                height={70}
                alt='icon'
              />
            </div>
            <h4 className='text-[27px]'>
              Was the funding utilized to achieve the set milestone goals?
            </h4>
            <p className='text-base mt-4 '>
              Vote in favour if you believe the milestones were achieved and
              funding was utilized judiciously.
            </p>

            <FormControl className='mt-7 w-full'>
              <RadioGroup
                aria-labelledby='demo-radio-buttons-group-label'
                defaultValue={'yes'}
                name='radio-buttons-group'
                onChange={(e) => setVote(e.target.value === 'yes')}
                row
                className='w-full flex justify-center gap-2'
              >
                <FormControlLabel
                  className='bg-[#F6F4FF] text-lg  rounded-xl pl-2 pr-12 w-[45%] mr-0'
                  value={'yes'}
                  // control={<Checkbox color='secondary' />}
                  control={<Radio color='secondary' />}
                  label='Yes,It Was'
                  checked={vote}
                />
                <FormControlLabel
                  className='bg-[#F6F4FF] ml-0.5 text-lg  rounded-xl pl-2 pr-12 py-2 w-[45%] mr-0'
                  value={'no'}
                  checked={!vote}
                  // control={<Checkbox color='secondary' />}
                  control={<Radio color='secondary' />}
                  label="No,It wasn't"
                />
              </RadioGroup>
            </FormControl>

            <button
              className='primary-btn  ml-auto in-dark w-button w-full '
              style={{ textAlign: 'center' }}
              onClick={() => handleVote()}
            >
              Vote
              <BiArrowBack
                className='rotate-180 ml-3 text-imbue-lime '
                size={18}
              />
            </button>
          </div>
        )}

        {((step === 2 && !vote) || (step === 0 && refundOnly)) && (
          <RefundModal
            setLoading={setLoading}
            handleVote={handleVoteOnMilestone}
            handleRefund={refund}
            setVisible={setVisible}
            refundOnly={refundOnly}
            undergoingRefund={project.project_in_voting_of_no_confidence || false}
          />
        )}

        {step === 4 && (
          <>
            {voteRefund === undefined ? (
              <SuccessModal setVisible={setVisible} />
            ) : (
              <SuccessRefundModal
                undergoingRefund={project?.project_in_voting_of_no_confidence || false}
                setVisible={setVisible}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
