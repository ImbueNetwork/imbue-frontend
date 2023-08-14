import { Tooltip } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { User } from '@/model';

type StateTagProps = {
    dateCreated: Date;
    text: string;
    voters: User[];
    allApprovers: User[];
    openVotingList: (_value: boolean) => void;
}

const ProjectStateTag = ({ dateCreated, text, voters, allApprovers, openVotingList }: StateTagProps) => {
    const pending = text === "Pending";
    const ongoin = text === "Ongoing";
    const completed = text === "Completed";

    return (
        <div className='flex flex-row items-center'>
            <p className='text-sm font-normal leading-[16px] text-content'>
                {moment(dateCreated)?.format('DD MMM, YYYY')}
            </p>
            <div className={`text-sm lg:text-xl ${voters?.length < (allApprovers?.length / 2) ? "text-imbue-coral" : "text-content-primary"} mr-[27px] ml-[14px] flex items-center gap-3`}>
                {
                    pending && <p className='text-gray-500 text-opacity-30'>{text}</p>
                }
                {
                    ongoin && (
                        <div className='flex flex-row items-center'>
                            <Tooltip title="See voting details">
                                <div
                                    onClick={() => openVotingList(true)}
                                    className='h-[16px] w-[16px] text-xs flex items-center justify-center rounded-[7.5px] bg-[#BAFF36]'
                                >?</div>
                            </Tooltip>

                            <p className='text-xl font-normal leading-[23px] text-[#BAFF36] ml-[14px]'>
                                Open for Voting
                            </p>
                        </div>
                    )
                }
                {
                    completed && <p className='text-content-primary'>{text}</p>
                }
                {/* {
                    (voters?.length && !pending) && (
                        <AvatarGroup spacing={8} max={voters.length}>
                            {
                                voters.map((approver: any) => {
                                    //TODO: if(approver Has voted)
                                    return (
                                        <figure key={approver.id} className='w-9 h-9 rounded-full overflow-hidden border border-black'>
                                            <Image height={100} width={100} className='h-full w-full object-cover' src={approver.profile_photo || freelalncerPic} alt="" />
                                        </figure>
                                    )
                                })
                            }
                        </AvatarGroup>
                    )
                } */}
            </div>
        </div>
    );
};

export default ProjectStateTag;