import { BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, useMediaQuery } from '@mui/material';
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

    const mobileView = useMediaQuery('(max-width:480px)');

    return (
        <Dialog
            open={open}
            onClose={() => setOpenVotingList(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='px-2 lg:p-14 errorDialogue'
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
                                                <p className='text-content text-xs'>
                                                    {
                                                        !mobileView
                                                            ? approver?.web3_address
                                                            : (
                                                                approver?.web3_address?.substring(0, 8) +
                                                                '...' +
                                                                approver?.web3_address?.substring(39)
                                                            )
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <p className='text-content-primary font-semibold text-sm lg:text-base'>
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