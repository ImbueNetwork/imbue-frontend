import { BottomNavigation, BottomNavigationAction, Dialog, DialogTitle } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import freelalncerPic from '@/assets/images/profile-image.png'
import { VotesResp } from '@/model';

import VotingListSkeleton from './VotingListSkeleton';


type VotingListProps = {
    open: boolean;
    loading: boolean;
    setOpenVotingList: (_value: boolean) => void;
    votes: VotesResp | null;
    // firstPendingMilestone: number;
    // setMilestoneVotes: (_value: any) => void;
    // approvers: User[];
    // chainProjectId: number | undefined;
    // projectId: number | undefined;
    // project: Project;
}

// type MilestoneVotes = {
//     voterAddress: any;
//     vote: boolean;
// }

const VotingList = (props: VotingListProps) => {
    const { setOpenVotingList, open, votes, loading } = props
    const [value, setValue] = React.useState(0);
    const [list, setList] = useState<any[]>([]);
    // const [votes, setVotes] = useState<any>([])
    // const { user, loading: userLoading } = useSelector(
    //     (state: RootState) => state.userState
    // );
    // const [loading, setLoading] = useState(false);

    // const firstPendingMilestone = props?.firstPendingMilestone >= 0 ? props?.firstPendingMilestone : project?.milestones?.length - 1

    // useEffect(() => {
    //     const syncVotes = async () => {
    //         if (!chainProjectId || !projectId || firstPendingMilestone === undefined) return

    //         const imbueApi = await initImbueAPIInfo();
    //         const chainService = new ChainService(imbueApi, user);
    //         const milestoneVotes: any = await chainService.getMilestoneVotes(
    //             chainProjectId,
    //             firstPendingMilestone
    //         );

    //         const votesArray = Object.keys(milestoneVotes)

    //         if (votesArray.length > 0) {
    //             const votes: MilestoneVotes[] = votesArray?.map((key: any) => ({
    //                 voterAddress: key,
    //                 vote: milestoneVotes[key],
    //             })) || [];

    //             const promises = votes.map(async (v) => await voteOnMilestone(null, v.voterAddress, firstPendingMilestone, v.vote, projectId))
    //             await Promise.all(promises)
    //             const voteResp = await getMillestoneVotes(projectId, firstPendingMilestone)
    //             setVotes(voteResp)
    //             setMilestoneVotes(voteResp?.allVoters)
    //             // const resp = await syncProjectVotes(projectId, firstPendingMilestone, votes)
    //         }
    //     }

    //     const setVotingList = async () => {
    //         if (!projectId || firstPendingMilestone === undefined) return

    //         setLoading(true)
    //         try {
    //             const voteResp = await getMillestoneVotes(projectId, firstPendingMilestone)
    //             setVotes(voteResp)
    //             setMilestoneVotes(voteResp?.allVoters)
    //             // const votersAddressed = voteResp?.map((voter: any) => voter.web3_address)
    //             syncVotes();
    //         } catch (error) {
    //             // eslint-disable-next-line no-console
    //             console.error(error);
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     setVotingList()
    // }, [user, firstPendingMilestone, setMilestoneVotes, projectId, approvers, chainProjectId])

    // useEffect(() => {
    //     const votedYes: User[] = []
    //     const votedNo: User[] = []
    //     const pendingVote: User[] = []

    //     approvers?.length && approvers?.forEach((approver) => {
    //         const match = votes.find((voter) => voter?.voterAddress === approver.web3_address)
    //         if (!approver.web3_address) return

    //         if (match) {
    //             if (match?.vote) votedYes.push(approver)
    //             else if (!match?.vote) votedNo.push(approver)
    //         }
    //         else pendingVote.push(approver)
    //     })

    //     switch (value) {
    //         case 0:
    //             setList(votedYes)
    //             break;
    //         case 1:
    //             setList(votedNo)
    //             break;
    //         case 2:
    //             setList(pendingVote)
    //             break;
    //     }

    // }, [value, approvers, user, chainProjectId, firstPendingMilestone, votes])

    useEffect(() => {
        switch (value) {
            case 0:
                setList(votes?.yes || [])
                break;
            case 1:
                setList(votes?.no || [])
                break;
            case 2:
                setList(votes?.pending || [])
                break;
        }

    }, [value, votes])


    return (
        <Dialog
            open={open}
            onClose={() => setOpenVotingList(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
            {
                (loading)
                    ? <VotingListSkeleton />
                    : <>
                        <DialogTitle id="responsive-dialog-title">
                            Voting List
                        </DialogTitle>
                        <div className='mx-5'>
                            <BottomNavigation
                                showLabels
                                color='secondary'
                                value={value}
                                onChange={(event, newValue) => {
                                    setValue(newValue);
                                }}
                                className='h-10'
                            >
                                <BottomNavigationAction label="Yes" />
                                <BottomNavigationAction label="No" />
                                <BottomNavigationAction label="Pending Vote" />
                            </BottomNavigation>
                        </div>
                        <div className='mx-5 border border-imbue-light-purple rounded-xl mb-5'>
                            {
                                list?.length && list.map((approver, index) => (
                                    <div
                                        key={index}
                                        className='p-3 border-b border-y-imbue-light-purple last:border-b-0 flex items-center justify-between'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Image src={approver.profile_photo || freelalncerPic} height={100} width={100} className='w-10 h-10 object-cover rounded-full' alt='' />
                                            <div className='flex flex-col gap-1'>
                                                {
                                                    approver?.display_name &&
                                                    <p className='text-content'>{approver.display_name}</p>
                                                }
                                                <p className='text-content text-xs'>{approver?.web3_address || approver?.approver}</p>
                                            </div>
                                        </div>
                                        <p className='text-content-primary font-semibold'>
                                            {value === 0 && "Yes"}
                                            {value === 1 && "No"}
                                            {value === 2 && "Pending"}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>
                    </>
            }
        </Dialog>
    );
};

export default VotingList;