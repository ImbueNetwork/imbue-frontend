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
  insertNoConfidenceVoter,
  updateFirstPendingMilestone,
  updateMilestone,
  updateProject,
  updateProjectVotingState,
  voteOnMilestone,
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
  targetUser?: User;
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
  refundOnly,
}: VotingModalProps) {
  const [vote, setVote] = useState<boolean>(true);
  const [voteRefund, setVoteRefund] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const handleVoteOnMilestone = async (vote: boolean) => {
    const milestoneKeyInView = project?.first_pending_milestone;
    if (!project?.id || !user.web3_address || milestoneKeyInView === undefined)
      return;

    try {
      const imbueApi = await initImbueAPIInfo();
      // const userRes: User | any = await utils.getCurrentUser();
      const chainService = new ChainService(imbueApi, user);

      const result = await chainService.voteOnMilestone(
        votingWalletAccount,
        project.chain_project_id,
        milestoneKeyInView,
        vote
      );

      let pollResult = ImbueChainPollResult.Pending;

      if (!result.txError) {
        pollResult = (await chainService.pollChainMessage(
          ImbueChainEvent.ApproveMilestone,
          votingWalletAccount
        )) as ImbueChainPollResult;
      } else {
        setError({ message: result.errorMessage });
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (pollResult == ImbueChainPollResult.EventFound) {
          await updateMilestone(Number(project.id), milestoneKeyInView, true);
          await updateProjectVotingState(Number(project.id), false);
          await updateFirstPendingMilestone(
            Number(project.id),
            Number(project.first_pending_milestone) + 1
          );

          await voteOnMilestone(
            user.id,
            user.web3_address,
            milestoneKeyInView,
            vote,
            project.id
          );
          ///// fire notifications //////////////////////////////////
          if (targetUser) {
            await sendNotification(
              [String(targetUser.id)],
              'approved_Milestone.testing',
              'A Milestone has been approved',
              `${
                project.milestones[project.first_pending_milestone || 0].name
              } , a milestone on ${user.display_name}'s ${
                project.name
              } just got marked as approved`,
              Number(project.id),
              Number(project.first_pending_milestone) + 1
            );
          }
          setStep(4);
          setVisible(true);
          break;
        } else if (result.status) {
          const resp = await voteOnMilestone(
            user.id,
            user.web3_address,
            milestoneKeyInView,
            vote,
            project.id
          );

          if (resp.milestoneApproved && targetUser?.id) {
            await sendNotification(
              [String(targetUser.id)],
              'approved_Milestone.testing',
              'A Milestone has been approved',
              `${
                project.milestones[project.first_pending_milestone || 0].name
              } , a milestone on ${user.display_name}'s ${
                project.name
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
        } else if (pollResult != ImbueChainPollResult.Pending) {
          const resp = await voteOnMilestone(
            user.id,
            user.web3_address,
            milestoneKeyInView,
            vote,
            project.id
          );

          if (resp.milestoneApproved && targetUser?.id) {
            await sendNotification(
              [String(targetUser.id)],
              'approved_Milestone.testing',
              'A Milestone has been approved',
              `approved milestone`,
              Number(project.id),
              Number(project.first_pending_milestone) + 1
            );
          }

          setStep(4);
          setVisible(true);
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

  const refund = async () => {
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

      if (project.project_in_voting_of_no_confidence) {
        const result = await chainService.voteOnNoConfidence(
          votingWalletAccount,
          project.chain_project_id,
          vote
        );

        if (!result.txError) {
          pollResult = (await chainService.pollChainMessage(
            ImbueChainEvent.NoConfidenceRoundFinalised,
            votingWalletAccount
          )) as ImbueChainPollResult;
          noConfidencePoll = (await chainService.pollChainMessage(
            ImbueChainEvent.VoteOnNoConfidenceRound,
            votingWalletAccount
          )) as ImbueChainPollResult;
        }

        while (true) {
          if (result.status || result.txError) {
            if (pollResult == ImbueChainPollResult.EventFound) {
              project.status_id = OffchainProjectState.Refunded;
              await updateProject(project?.id, project);
              await insertNoConfidenceVoter(project?.id, user);

              setVisible(true);
              setVoteRefund(true);
              setStep(4);
              break;
            } else if (noConfidencePoll == ImbueChainPollResult.EventFound) {
              await insertNoConfidenceVoter(project?.id, user);

              setVisible(true);
              setVoteRefund(true);
              setStep(4);
              break;
            } else if (result.status) {
              setVisible(true);
              setStep(4);
              setVoteRefund(true);
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
            votingWalletAccount
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
              setStep(4);
              setVoteRefund(true);
              setVisible(true);
            } else if (result.status) {
              setStep(4);
              setVoteRefund(true);
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
          {step > 0 && (
            <ArrowBackIcon
              className='h-7 w-7 hover:bg-imbue-purple rounded-full hover:text-white cursor-pointer border absolute left-5'
              color='secondary'
              onClick={() => setStep((prev) => prev - 1)}
            />
          )}
          <CloseIcon
            className='h-7 w-7 hover:bg-imbue-purple rounded-full hover:text-white cursor-pointer border p-1 absolute right-5'
            color='secondary'
            onClick={() => setVisible(false)}
          />
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
          />
        )}

        {step === 4 && (
          <>
            {!voteRefund ? (
              <SuccessModal setVisible={setVisible} />
            ) : (
              <SuccessRefundModal setVisible={setVisible} />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
