import { BottomNavigation, BottomNavigationAction, Dialog, DialogTitle } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import freelalncerPic from '@/assets/images/profile-image.png'
import { Project, User } from '@/model';
import { getProjectNoConfidenceVoters } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

import VotingListSkeleton from './VotingListSkeleton';


type VotingListProps = {
    open: boolean;
    setOpenNoRefundList: (_value: boolean) => void;
    setMilestoneVotes: (_value: any) => void;
    approvers: User[];
    project: Project
}

const NoConfidenceList = (props: VotingListProps) => {
    const { setOpenNoRefundList, approvers, open, setMilestoneVotes, project } = props
    const [value, setValue] = React.useState(0);
    const [list, setList] = useState<any[]>([]);
    const [votes, setVotes] = useState<any>([])
    const { user, loading: userLoading } = useSelector(
        (state: RootState) => state.userState
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const setVotingList = async () => {
            if (!project?.id) return

            setLoading(true)
            try {
                const voteResp = await getProjectNoConfidenceVoters(project?.id)
                const pending: any = [];

                const voteAddress = voteResp.map((voter: any) => voter.web3_address)

                approvers.forEach((approver: User) => {
                    if (!voteAddress.includes(approver.web3_address)) {
                        pending.push(approver)
                    }
                });

                setVotes({ yes: voteResp, pending: pending })
                // const votersAddressed = voteResp?.map((voter: any) => voter.web3_address)
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                setLoading(false)
            }
        }

        setVotingList()
    }, [user, setMilestoneVotes, project?.id, approvers])


    useEffect(() => {
        switch (value) {
            case 0:
                setList(votes.yes)
                break;
            case 1:
                setList(votes.no)
                break;
            case 2:
                setList(votes.pending)
                break;
        }

    }, [value, votes])


    return (
        <Dialog
            open={open}
            onClose={() => setOpenNoRefundList(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
            {
                (loading || userLoading)
                    ? <VotingListSkeleton />
                    : <>
                        <DialogTitle id="responsive-dialog-title">
                            Refund Voting List
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

export default NoConfidenceList;