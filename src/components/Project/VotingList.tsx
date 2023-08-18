import { BottomNavigation, BottomNavigationAction, Dialog, DialogTitle } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import freelalncerPic from '@/assets/images/profile-image.png'
import { User, Vote } from '@/model';


type VotingListProps = {
    open: boolean;
    setOpenVotingList: (_value: boolean) => void;
    votes: Vote[];
    approvers: User[];
}

const VotingList = (props: VotingListProps) => {
    const { open, setOpenVotingList, votes, approvers } = props
    const [value, setValue] = React.useState(0);
    const [list, setList] = useState<User[]>([]);

    useEffect(() => {
        const votedYes: User[] = []
        const votedNo: User[] = []
        const pendingVote: User[] = []

        approvers?.length &&  approvers?.forEach((approver) => {
            const match = votes.find((voter) => voter?.voterAddress === approver.web3_address)
            if (!approver.web3_address) return

            if (match) {
                if (match?.vote) votedYes.push(approver)
                else if (!match?.vote) votedNo.push(approver)
            }
            else pendingVote.push(approver)
        })

        switch (value) {
            case 0:
                setList(votedYes)
                break;
            case 1:
                setList(votedNo)
                break;
            case 2:
                setList(pendingVote)
                break;
        }
    }, [value, approvers, votes])

    return (
        <Dialog
            open={open}
            onClose={() => setOpenVotingList(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
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
                    list?.length && list.map((approver) => (
                        <div
                            key={approver.id}
                            className='p-3 border-b border-y-imbue-light-purple last:border-b-0 flex items-center justify-between'
                        >
                            <div className='flex items-center gap-2'>
                                <Image src={approver.profile_photo || freelalncerPic} height={100} width={100} className='w-8 h-8 object-cover rounded-full' alt='' />
                                <p className='text-content text-sm'>{approver.web3_address}</p>
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
        </Dialog>
    );
};

export default VotingList;