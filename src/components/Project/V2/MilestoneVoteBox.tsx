import { Avatar, AvatarGroup, LinearProgress, Skeleton } from '@mui/material';
import { WalletAccount } from '@talismn/connect-wallets';
import React, { useEffect, useState } from 'react';

import { initImbueAPIInfo } from '@/utils/polkadot';

import VoteModal from '@/components/ReviewModal/VoteModal';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { Project, User } from '@/model';
import ChainService from '@/redux/services/chainService';
import { getMillestoneVotes, voteOnMilestone } from '@/redux/services/projectServices';

type MilestoneVoteBoxProps = {
    firstPendingMilestone: number;
    chainProjectId: number | undefined;
    projectId: number | undefined;
    user: User;
    approvers: User[];
    canVote: boolean;
    isApplicant: boolean;
    project: Project;
    setSuccess: (_value: boolean) => void;
    setSuccessTitle: (_value: string) => void;
    setError: (_value: any) => void;
    setOpenVotingList: (_value: boolean) => void;
    setLoadingMain: (_value: boolean) => void;
}

type MilestoneVotes = {
    voterAddress: any;
    vote: boolean;
}

type Votes = {
    yes: User[];
    no: User[];
    pending: User[];
}

const MilestoneVoteBox = (props: MilestoneVoteBoxProps) => {
    const { chainProjectId, projectId, user, approvers, project, setError, setLoadingMain } = props;

    const [votes, setVotes] = useState<Votes | null>(null)
    const [loading, setLoading] = useState(true)

    const [showPolkadotAccounts, setShowPolkadotAccounts] = useState<boolean>(false);
    const [votingWalletAccount, setVotingWalletAccount] = useState<WalletAccount | any>({});
    const [showVotingModal, setShowVotingModal] = useState<boolean>(false);

    const totalVoters = approvers?.length || 0
    const yesCount = votes?.yes?.length || 0
    const noCount = votes?.no?.length || 0

    const yesPercent = (yesCount / totalVoters) * 100
    const noPercent = (noCount / totalVoters) * 100

    const firstPendingMilestone = props?.firstPendingMilestone >= 0 ? props?.firstPendingMilestone : project?.milestones?.length - 1
    const currentMilestoneName = project?.milestones?.length ? project?.milestones?.[firstPendingMilestone]?.name || "" : ""


    useEffect(() => {
        const syncVotes = async () => {
            if (!chainProjectId || !projectId || firstPendingMilestone === undefined) return

            const imbueApi = await initImbueAPIInfo();
            const chainService = new ChainService(imbueApi, user);
            const milestoneVotes: any = await chainService.getMilestoneVotes(
                chainProjectId,
                firstPendingMilestone
            );

            const votesArray = Object.keys(milestoneVotes)

            if (votesArray.length > 0) {
                const votes: MilestoneVotes[] = votesArray?.map((key: any) => ({
                    voterAddress: key,
                    vote: milestoneVotes[key],
                })) || [];

                const promises = votes.map(async (v) => await voteOnMilestone(null, v.voterAddress, firstPendingMilestone, v.vote, projectId))
                await Promise.all(promises)
                const voteResp = await getMillestoneVotes(projectId, firstPendingMilestone)
                setVotes(voteResp)
                // const resp = await syncProjectVotes(projectId, firstPendingMilestone, votes)
            }
        }

        const setVotingList = async () => {
            if (!projectId || firstPendingMilestone === undefined) return

            setLoading(true)
            try {
                const voteResp = await getMillestoneVotes(projectId, firstPendingMilestone)
                setVotes(voteResp)
                setLoading(false)
                // const votersAddressed = voteResp?.map((voter: any) => voter.web3_address)
                syncVotes();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                setLoading(false)
            }
        }

        setVotingList()
    }, [user, firstPendingMilestone, projectId, chainProjectId])



    const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);

    // voting on a mile stone
    const handleVoting = (milestone_index: number) => {
        // show polkadot account modal
        setShowPolkadotAccounts(true);
        // set submitting mile stone to false
        // setMile stone key in view
        setMilestoneKeyInView(milestone_index);
    }

    return (
        <div>
            {
                loading
                    ? <Skeleton variant="text" className='w-2/5' />
                    : (
                        <div className='flex justify-between text-black'>
                            <p>Milestone Vote Results</p>
                            <p>{firstPendingMilestone + 1}/{project?.milestones?.length}</p>
                        </div>
                    )
            }
            <div className='bg-light-grey mt-5 py-7 rounded-xl px-3'>
                {
                    loading
                        ? (
                            <div className='flex items-center justify-between'>
                                <Skeleton variant="text" className='w-2/3' />
                                <Skeleton variant="text" className='w-1/4' />
                            </div>
                        )
                        : (
                            <div className='flex text-black items-center'>
                                <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                                    <span className='relative text-sm z-10'>{firstPendingMilestone + 1}</span>
                                    <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                                </div>
                                <p className='ml-2'>
                                    {
                                        currentMilestoneName?.length > 16
                                            ? `${currentMilestoneName?.substring(0, 16)}...`
                                            : currentMilestoneName
                                    }
                                </p>
                                {
                                    props?.canVote &&
                                        project.project_in_milestone_voting &&
                                        !props?.isApplicant
                                        ? (
                                            <button
                                                className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto'
                                                onClick={() => handleVoting(firstPendingMilestone)}
                                            >
                                                Vote
                                            </button>)
                                        : (
                                            <button
                                                className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto nowrap'
                                                onClick={() => props?.setOpenVotingList(true)}
                                            >
                                                See All Votes
                                            </button>)
                                }

                            </div>
                        )
                }
                <div className='flex mt-7 justify-between gap-2'>
                    {
                        loading
                            ? (
                                <div className='w-1/2'>
                                    <div className='flex'>
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                    </div>
                                    <Skeleton variant="text" className='w-full' />
                                </div>)
                            : (
                                <div
                                    className='mt-auto cursor-pointer'
                                    onClick={() => props?.setOpenVotingList(true)}
                                >
                                    <AvatarGroup className='justify-end' max={3}>
                                        {
                                            votes?.no?.map((v, index) => (
                                                <Avatar className='h-6 w-6 !border !border-white' key={index} alt="Remy Sharp" src={v.profile_photo || '/profile-image.png'} />
                                            ))
                                        }
                                    </AvatarGroup>
                                    <p className='text-black text-sm'>
                                        No <span className='text-gray-400'>({noCount} votes/ {noPercent}%)</span>
                                    </p>
                                </div>
                            )
                    }
                    {
                        loading
                            ? (
                                <div className='w-1/2'>
                                    <div className='flex justify-end'>
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                        <Skeleton variant="circular" className='w-5 h-5' />
                                    </div>
                                    <Skeleton variant="text" className='w-full' />
                                </div>)
                            : (
                                <div
                                    className='mt-auto cursor-pointer'
                                    onClick={() => props?.setOpenVotingList(true)}
                                >
                                    <AvatarGroup max={3}>
                                        {
                                            votes?.yes?.map((v, index) => (
                                                <Avatar className='h-6 w-6 !border !border-white' key={index} alt="Remy Sharp" src={v.profile_photo || '/profile-image.png'} />
                                            ))
                                        }
                                    </AvatarGroup>
                                    <p className='text-black text-sm'>
                                        <span className='text-gray-400'>
                                            ({yesCount} Votes/ {yesPercent}%)</span> Yes
                                    </p>
                                </div>
                            )
                    }
                </div>
                <div className='flex w-full items-center rounded-full relative mt-5 bg-[#DDDCD6]'>
                    <LinearProgress
                        className='w-[52%] text-imbue-coral rotate-180 before:bg-[#DDDCD6]    h-5 rounded-full'
                        color='inherit'
                        variant='determinate'
                        value={loading ? 0 : noPercent}
                    />
                    <div className='w-3 left-[47%] top-[20%] absolute z-10 bg-[#DDDCD6] rounded-full h-3'></div>
                    {
                        yesPercent
                            ? (
                                <LinearProgress
                                    className='w-[55%] h-5 -ml-5 rounded-full bg-[#DDDCD6]'
                                    variant='determinate'
                                    value={loading ? 0 : yesPercent}
                                    color='secondary'
                                />)
                            : ""
                    }
                </div>
            </div>

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
                    milestoneKeyInView
                }}
            />
        </div>
    );
};

export default MilestoneVoteBox;