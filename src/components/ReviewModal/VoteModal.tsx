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

import { initImbueAPIInfo } from '@/utils/polkadot';

import { ImbueChainPollResult, OffchainProjectState, Project, User } from '@/model';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';
import { insertNoConfidenceVoter, updateFirstPendingMilestone, updateMilestone, updateProject, updateProjectVotingState, voteOnMilestone } from '@/redux/services/projectServices';

import ReviewModal from './ReviewModal';
import SuccessModal from './SuccessModal';
import RefundModal from '../RefundModal/RefundModal';
import SuccessRefundModal from '../RefundModal/SuccessRefundModal';

interface VotingModalProps {
  visible: boolean;
  setVisible: (_visible: boolean) => void;
  setLoading: (_visible: boolean) => void;
  project: Project;
  user: User;
  votingWalletAccount: WalletAccount | any;
  milestoneKeyInView: number;
  setError: (_value: any) => void;
}

export default function VoteModal({ visible, setVisible, setLoading, project, user, votingWalletAccount, milestoneKeyInView, setError }: VotingModalProps) {
  const [vote, setVote] = useState<boolean>(true);
  const [step, setStep] = useState<number>(0)

  const handleVoteOnMilestone = async (vote: boolean) => {
    if (!project?.id || !user.web3_address) return

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
          await updateProjectVotingState(Number(project.id), false)
          await updateFirstPendingMilestone(Number(project.id), (Number(project.first_pending_milestone) + 1))
          await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

          setVisible(true);
          setStep(4)
          break;

        } else if (result.status) {
          await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

          setVisible(true);
          setStep(4)
          break;

        } else if (result.txError) {
          setError({ message: result.errorMessage });

          setVisible(false);
          break;

        } else if (pollResult != ImbueChainPollResult.Pending) {
          await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

          setVisible(true);
          setStep(4)
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }

    } catch (error) {
      setError({ message: 'Could not vote. Please try again later' });
      // eslint-disable-next-line no-console
      console.error(error)
      // setLoading(false);
    }
    // finally {
    //   setLoading(false);
    // }
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
              setStep(4)
              break;
            } else if (noConfidencePoll == ImbueChainPollResult.EventFound) {
              await insertNoConfidenceVoter(project?.id, user);

              setVisible(true);
              setStep(4)

              break;
            } else if (result.status) {
              setVisible(true);
              setStep(4)

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
              setStep(4)
              setVisible(true);

            } else if (result.status) {
              setStep(4)
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
    if (vote) {
      setLoading(true)
      setVisible(false);
      await handleVoteOnMilestone(vote);
      setLoading(false)
    }
    else {
      setStep(3)
    }
  }


  return (
    <Modal
      open={visible}
      className='flex justify-center items-center'
      // onClose={() => {setVisible(false)}}
    >
      <div>
        {
          step === 0 && (
            <ReviewModal
              {...{
                setStep,
                setVisible
              }}
            />
          )
        }
        {
          step === 1 && (
            <div className='bg-white justify-center max-w-[31.938rem] px-12 text-center py-5 rounded-[18px]'>
              <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
                <Image src={'/confirm-icon.svg'} width={70} height={70} alt='icon' />
              </div>
              <h4 className='text-[27px]'>
                Was the funding utilized to achieve the set milestone goals?
              </h4>
              <p className='text-base mt-4 '>
                Vote in favour if you believe the milestones were achieved and funding
                was utilized judiciously.
              </p>

              <FormControl className='mt-7'>
                <RadioGroup
                  aria-labelledby='demo-radio-buttons-group-label'
                  defaultValue={'yes'}
                  name='radio-buttons-group'
                  onChange={(e) => setVote(e.target.value === 'yes')}
                  row
                >
                  <FormControlLabel
                    className='bg-[#F6F4FF] text-lg  rounded-xl pl-2 pr-12 '
                    value={'yes'}
                    // control={<Checkbox color='secondary' />}
                    control={<Radio color='secondary' />}
                    label='Yes,It Was'
                  />
                  <FormControlLabel
                    className='bg-[#F6F4FF] ml-0.5 text-lg  rounded-xl pl-2 pr-12 py-2'
                    value={'no'}
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
                <BiArrowBack className='rotate-180 ml-3 text-imbue-lime ' size={18} />
              </button>
            </div>
          )
        }

        {
          step === 3 && !vote && (
            <RefundModal handleRefund={refund} setVisible={setVisible} />
          )
        }

        {
          step === 4 && (
            <>
              {
                vote
                  ? <SuccessModal setVisible={setVisible} />
                  : <SuccessRefundModal setVisible={setVisible} />
              }
            </>
          )

        }

      </div>



    </Modal>

  );
}
