import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { WalletAccount } from '@talismn/connect-wallets';
import axios from 'axios'
import moment from 'moment';
import React, { useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';

import { initImbueAPIInfo } from '@/utils/polkadot';

import VoteModal from '@/components/ReviewModal/VoteModal';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { ImbueChainPollResult, Milestone, OffchainProjectState, Project, User } from '@/model';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';
import { updateMilestone, updateProjectVotingState } from '@/redux/services/projectServices';
import { updateFirstPendingMilestone } from '@/redux/services/projectServices';
import { voteOnMilestone } from '@/redux/services/projectServices';
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
}

const ExpandableMilestone = ({ index, item: milestone, project, isApplicant, projectType, isProjectOwner, setLoading, setError, user, setSuccessTitle, setSuccess }: ExpandableMilestonProps) => {
    const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);
    const [submittingMilestone, setSubmittingMilestone] = useState<boolean>(false);
    const [showPolkadotAccounts, setShowPolkadotAccounts] = useState<boolean>(false);
    const [withdrawMilestone, setWithdrawMilestone] = useState<boolean>(false);
    const [votingWalletAccount, setVotingWalletAccount] = useState<WalletAccount | any>({});
    const [showVotingModal, setShowVotingModal] = useState<boolean>(false);


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (!target?.files?.length) return

        const file = target?.files[0]
        // const filename = encodeURIComponent(file.name);

        const data = new FormData()
        data.append('file', file)

        await axios.post(`/api/upload`, data)
    }

    // submitting a milestone
    const submitMilestone = async (account: WalletAccount) => {
        if (!project?.chain_project_id)
            return setError({ message: "No project found" })

        setLoading(true);

        try {
            const imbueApi = await initImbueAPIInfo();
            const chainService = new ChainService(imbueApi, user);
            const result = await chainService.submitMilestone(
                account,
                project.chain_project_id,
                milestoneKeyInView
            );

            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (result.status || result.txError) {
                    if (result.status) {
                        const resp = await updateProjectVotingState(Number(project.id), true)
                        if (resp) {
                            setSuccess(true);
                            setSuccessTitle('Milestone Submitted Successfully');
                        } else {
                            setError({ message: "Server error. Could not update project voting status." })
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
        setSubmittingMilestone(true)
        // setMile stone key in view
        setMilestoneKeyInView(milestone_index)
    }



    // voting on a mile stone
    const handleVoting = (milestone_index: number) => {
        // show polkadot account modal
        setShowPolkadotAccounts(true);
        // set submitting mile stone to false
        setSubmittingMilestone(false);
        // setMile stone key in view
        setMilestoneKeyInView(milestone_index);
    }

    const handleVoteOnMilestone = async (vote: boolean) => {
        setLoading(true);

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
                    await updateMilestone(milestone.project_id, milestoneKeyInView, true);
                    await updateProjectVotingState(Number(project.id), false)
                    await updateFirstPendingMilestone(Number(project.id), (Number(project.first_pending_milestone) + 1))
                    await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

                    setSuccess(true);
                    setSuccessTitle('Your vote was successful. This milestone has been completed.');
                    setLoading(false);
                    break;

                } else if (result.status) {
                    await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

                    setSuccess(true);
                    setSuccessTitle('Your vote was successful.');
                    setLoading(false);
                    break;

                } else if (result.txError) {
                    setError({ message: result.errorMessage });
                    setLoading(false);
                    break;

                } else if (pollResult != ImbueChainPollResult.Pending) {
                    await voteOnMilestone(user.id, user.web3_address, milestoneKeyInView, vote, project.id)

                    setSuccess(true);
                    setSuccessTitle('Request resolved successfully');
                    setLoading(false);
                    break;
                }
                await new Promise((f) => setTimeout(f, 1000));
            }
        } catch (error) {
            setError({ message: 'Could not vote. Please try again later' });
            // eslint-disable-next-line no-console
            console.error(error)
            setLoading(false);
        }
        // finally {
        //     console.log("in finally");

        //     setLoading(false);
        // }
    };


    // voting on a mile stone
    const handleWithdraw = (milestone_index: number) => {
        // set submitting mile stone to true
        setWithdrawMilestone(true);
        // show polkadot account modal
        setShowPolkadotAccounts(true);
        // setMile stone key in view
        setMilestoneKeyInView(milestone_index);
    }


    // withdrawing funds
    const withdraw = async (account: WalletAccount) => {
        setLoading(true);

        try {
            const imbueApi = await initImbueAPIInfo();
            const projectMilestones = project.milestones;
            // const user: User | any = await utils.getCurrentUser();
            const chainService = new ChainService(imbueApi, user);
            const result = await chainService.withdraw(account, project.chain_project_id);

            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (result.status || result.txError) {
                    console.log("🚀 ~ file: ExpandableMilestone.tsx:226 ~ withdraw ~ result:", result)
                    if (result.status) {
                        const haveAllMilestonesBeenApproved = projectMilestones
                            .map((m: any) => m.is_approved)
                            .every(Boolean);
                        console.log("🚀 ~ file: ExpandableMilestone.tsx:229 ~ withdraw ~ haveAllMilestonesBeenApproved:", haveAllMilestonesBeenApproved)

                        if (haveAllMilestonesBeenApproved) {
                            project.status_id = OffchainProjectState.Completed;
                            project.completed = true;
                            await updateProject(Number(project?.id), project);
                        }
                        setLoading(false);
                        setSuccess(true);
                        setSuccessTitle('Withdraw successfull');
                    } else if (result.txError) {
                        setLoading(false);
                        setError({ message: "Error : " + result.errorMessage });
                    }
                    break;
                }
                await new Promise((f) => setTimeout(f, 1000));
            }
        } catch (error) {
            setError({ message: "Error" + error });
        }
    };

    return (
        <>
            {
                showPolkadotAccounts && (
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
                    />)
            }

            {
                showVotingModal && (
                    <VoteModal
                        visible={showVotingModal}
                        setVisible={setShowVotingModal}
                        handleVote={handleVoteOnMilestone}
                    />

                )
            }

            <Accordion
                className='shadow-none mt-5 before:h-0 !rounded-xl py-5'
            >
                <AccordionSummary
                    aria-controls='panel1a-content'
                    id='panel1a-header'
                >
                    <Typography className='grid grid-cols-12 gap-5 w-full'>
                        <div className='col-start-1 col-end-7  flex items-center'>
                            <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                                <span className='relative text-sm z-10'>{index + 1}</span>
                                <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                            </div>
                            <p className='text-black ml-3 text-2xl'>{milestone.name}</p>
                        </div>
                        <p className='col-start-7 col-end-9 text-lg mr-10 ml-4'>
                            ${milestone.amount}
                        </p>
                        <p className='col-start-9 text-lg col-end-11 ml-4'>
                            {moment(milestone.modified).format("MMM Do YY")}
                        </p>

                        {/* <p
                        className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${item.is_approved
                            ? 'bg-lime-100 text-lime-600'
                            : 'bg-red-100 text-red-500'}`}
                    >
                        {item.is_approved ? 'Completed' : 'Open for voting'}
                    </p> */}
                        {
                            project.first_pending_milestone === milestone.milestone_index &&
                                project.project_in_milestone_voting
                                ? (
                                    <p
                                        className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${milestone.is_approved
                                            ? 'bg-lime-100 text-lime-600'
                                            : 'bg-red-100 text-red-500'}`}
                                    >
                                        {milestone.is_approved ? 'Completed' : 'Open for voting'}
                                    </p>)
                                : (
                                    <p
                                        className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${milestone.is_approved
                                            ? 'bg-lime-100 text-lime-600'
                                            : 'bg-[#EBEAE2] text-[#949494]'}`}
                                    >
                                        {milestone.is_approved ? 'Completed' : 'Pending'}
                                    </p>)
                        }
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className='px-2'>
                        <div>
                            <p className='text-black mt-10 font-semibold text-lg'>
                                Milestone description and expectation
                            </p>
                            <p className='mt-5'>{milestone.description}</p>
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
                                to the live website
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

                            <input
                                onChange={(e) => handleUpload(e)}
                                type="file"
                            />
                            <div className='w-full mt-7 flex'>

                                {
                                    user?.id &&
                                    !isApplicant &&
                                    project.first_pending_milestone === milestone.milestone_index &&
                                    project.project_in_milestone_voting && (
                                        <button
                                            className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                            style={{ textAlign: 'center' }}
                                            onClick={() => handleVoting(milestone.milestone_index)}
                                        >
                                            Vote for Milestone
                                        </button>
                                    )
                                }

                                {
                                    (isApplicant || (projectType === 'grant' && isProjectOwner)) &&
                                    milestone.milestone_index == project.first_pending_milestone &&
                                    !project.project_in_milestone_voting &&
                                    !milestone?.is_approved && (
                                        <button
                                            className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                            style={{ textAlign: 'center' }}
                                            onClick={() => handleSubmitMilestone(milestone.milestone_index)}
                                        >
                                            Submit Milestone
                                        </button>
                                    )
                                }

                                {
                                    isApplicant && milestone.is_approved && (
                                        <button
                                            className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                            style={{ textAlign: 'center' }}
                                            onClick={() => handleWithdraw(milestone.milestone_index)}
                                        >
                                            Withdraw
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    )
};

export default ExpandableMilestone;