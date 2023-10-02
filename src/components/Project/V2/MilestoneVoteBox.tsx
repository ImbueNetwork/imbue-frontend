import { LinearProgress, Skeleton } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { initImbueAPIInfo } from '@/utils/polkadot';

import { User } from '@/model';
import ChainService from '@/redux/services/chainService';
import { getMillestoneVotes, voteOnMilestone } from '@/redux/services/projectServices';

type MilestoneVoteBoxProps = {
    firstPendingMilestone: number | undefined;
    chainProjectId: number | undefined;
    projectId: number | undefined;
    user: User;
    approvers: User[];
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
    const { chainProjectId, projectId, firstPendingMilestone, user, approvers } = props;

    const [votes, setVotes] = useState<Votes | null>(null)
    console.log("🚀 ~ file: MilestoneVoteBox.tsx:32 ~ MilestoneVoteBox ~ votes:", votes)
    const [loading, setLoading] = useState(true)

    const totalVoters = approvers?.length || 0
    const yesCount = votes?.yes?.length || 0
    const noCount = votes?.no?.length || 0

    const yesPercent = (yesCount / totalVoters) * 100
    const noPercent = (noCount / totalVoters) * 100

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

    return (
        <div>
            {
                loading
                    ? <Skeleton variant="text" className='w-2/5' />
                    : (
                        <div className='flex justify-between text-black'>
                            <p>Milestone Vote Results</p>
                            <p>1/6</p>
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
                                    <span className='relative text-sm z-10'>{1}</span>
                                    <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                                </div>
                                <p className='ml-2'>This is a milestone</p>
                                <button className='bg-white text-black text-sm rounded-full px-3 py-2 ml-auto'>
                                    Vote
                                </button>
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
                                        <span className='text-gray-400'>
                                            ({yesCount} Votes/ {yesPercent}%)</span>Yes
                                    </p>
                                </div>
                            )
                    }
                </div>
                {
                    loading
                        ? <Skeleton variant="text" className='w-full' />
                        : (
                            <div className='flex w-full relative mt-5'>
                                <LinearProgress
                                    className='w-[50%] text-imbue-coral rotate-180 before:bg-[#DDDCD6]    h-5 rounded-full'
                                    color='inherit'
                                    variant='determinate'
                                    value={noPercent}
                                />
                                <div className='w-3 left-[47%] top-[20%] absolute z-10 bg-[#DDDCD6] rounded-full h-3'></div>
                                <LinearProgress
                                    className='w-[50%] h-5 -ml-3 rounded-full bg-[#DDDCD6]'
                                    variant='determinate'
                                    value={yesPercent}
                                />
                            </div>
                        )
                }
            </div>
        </div>
    );
};

export default MilestoneVoteBox;