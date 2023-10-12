import { Avatar, AvatarGroup, LinearProgress } from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import React, { useState } from 'react';

import { NoConfidenceVoter } from '@/lib/queryServices/projectQueries';

import VoteModal from '@/components/ReviewModal/VoteModal';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { Project, User } from '@/model';

type MilestoneVoteBoxProps = {
    user: User;
    noConfidenceVoters: NoConfidenceVoter[];
    canVote: boolean;
    isApplicant: boolean;
    project: Project;
    setError: (_value: any) => void;
    setOpenVotingList: (_value: boolean) => void;
    setLoadingMain: (_value: boolean) => void;
    approversCount: number;
    approverVotedOnRefund: boolean;
}

const NoConfidenceBox = (props: MilestoneVoteBoxProps) => {
    const { user, project, setLoadingMain, setError, noConfidenceVoters, approverVotedOnRefund } = props;

    const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);
    const [showPolkadotAccounts, setShowPolkadotAccounts] = useState<boolean>(false);
    const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
    const [votingWalletAccount, setVotingWalletAccount] = useState<WalletAccount | any>({});
    const [refundOnly, setRefundOnly] = useState<boolean>(false);

    const handleVoting = (milestone_index: number) => {
        // show polkadot account modal
        setShowPolkadotAccounts(true);
        // set submitting mile stone to false
        // setMile stone key in view
        setMilestoneKeyInView(milestone_index);
    }

    return (
        <div>
            <div className='bg-[#FFDAD8] px-3 rounded-xl py-3 border border-[#FF8C86] mb-4'>
                <div className='flex items-center justify-between text-black'>
                    <p>
                        <span className='text-red-600 mr-1 font-bold'>‼️</span>
                        Refund Vote Result
                    </p>
                    {/* <p>{firstPendingMilestone + 1}/{project?.milestones?.length}</p> */}
                    <div className='flex text-black items-center'>

                        {
                            props?.canVote &&
                                project.project_in_milestone_voting &&
                                project?.first_pending_milestone !== undefined &&
                                !props.approverVotedOnRefund &&
                                !props?.isApplicant
                                ? (
                                    <button
                                        className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto'
                                        onClick={() => project?.first_pending_milestone !== undefined && handleVoting(project.first_pending_milestone)}
                                    >
                                        Vote
                                    </button>)
                                : !project.brief_id && (
                                    <button
                                        className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto nowrap'
                                        onClick={() => props?.setOpenVotingList(true)}
                                    >
                                        See All Votes
                                    </button>
                                )
                        }
                    </div>
                </div>
                <div className='bg-white mt-5 py-7 rounded-xl px-3'>
                    <div className='flex justify-between gap-2'>
                        <div
                            className='mt-auto cursor-pointer'
                            onClick={() => props?.setOpenVotingList(true)}
                        >
                            {
                                        /* <AvatarGroup className='justify-end' max={3}>
                                        {
                                            [1, 2, 3].map((v, index) => (
                                                <Avatar className='h-6 w-6 !border !border-white' key={index} alt="Remy Sharp" src={v.profile_photo || '/profile-image.png'} />
                                            ))
                                        }
                                            </AvatarGroup> */}
                            <p className='text-black text-sm'>
                                No <span className='text-gray-400'>({0} votes/ {0}%)</span>
                            </p>
                        </div>
                        <div
                            className='mt-auto cursor-pointer'
                            onClick={() => props?.setOpenVotingList(true)}
                        >
                            <AvatarGroup max={3}>
                                {
                                    noConfidenceVoters.map((v, index) => (
                                        <Avatar className='h-6 w-6 !border !border-white' key={index} alt="Remy Sharp" src={v.profile_photo || '/profile-image.png'} />
                                    ))
                                }
                            </AvatarGroup>
                            <p className='text-black text-sm'>
                                <span className='text-gray-400'>
                                    ({noConfidenceVoters.length} Votes/ {(noConfidenceVoters.length / props.approversCount) * 100}%)</span> Yes
                            </p>
                        </div>
                    </div>
                    <div className='flex w-full items-center rounded-full relative mt-5 bg-[#DDDCD6]'>
                        <LinearProgress
                            className='w-[52%] text-imbue-coral rotate-180 before:bg-[#DDDCD6]    h-5 rounded-full'
                            color='inherit'
                            variant='determinate'
                            value={0}
                        />
                        <div className='w-3 left-[47%] top-[20%] absolute z-10 bg-[#DDDCD6] rounded-full h-3'></div>
                        {
                            noConfidenceVoters?.length
                                ? (
                                    <LinearProgress
                                        className='w-[55%] h-5 -ml-5 rounded-full bg-[#DDDCD6]'
                                        variant='determinate'
                                        value={(noConfidenceVoters.length / props.approversCount) * 100 || 0}
                                        color='secondary'
                                    />)
                                : ""
                        }
                    </div>
                </div>
            </div>
            {
                props.canVote && !approverVotedOnRefund &&
                (
                    <div className='bg-[#FFDAD8] px-2 rounded-xl py-3 border border-[#FF8C86] mb-4'>
                        <p className='text-black'>
                            <span className='text-red-600 mr-1 font-bold'>‼️</span>
                            Refund Vote Result
                        </p>

                        {/* <button>Voting Ends</button> */}

                        <div className='bg-imbue-coral p-4 rounded-xl mt-3'>
                            <p className='text-base'>Has funding been utilised properly?</p>
                            <p className='text-sm opacity-70 mt-1'>A Vote of No confidence has been raised by an approver on this project and you’re now voting either for or againt a refund be made.</p>
                        </div>
                        <button
                            className='primary-btn in-dark w-button w-full mt-3'
                            onClick={() => {
                                if (project.first_pending_milestone !== undefined) {
                                    setRefundOnly(true)
                                    handleVoting(project.first_pending_milestone)
                                }
                            }}
                        >
                            Vote for Refund
                        </button>
                    </div>
                )
            }

            <Web3WalletModal
                accountSelected={async (account: WalletAccount) => {
                    setVotingWalletAccount(account);
                    setShowVotingModal(true);
                    setShowPolkadotAccounts(false);
                }}
                polkadotAccountsVisible={showPolkadotAccounts}
                showPolkadotAccounts={setShowPolkadotAccounts}
            />

            <VoteModal
                visible={showVotingModal}
                setVisible={setShowVotingModal}
                {...{
                    setLoading: setLoadingMain,
                    project,
                    user,
                    setError,
                    votingWalletAccount,
                    milestoneKeyInView,
                    refundOnly
                }}
            />
        </div >
    );
};

export default NoConfidenceBox;