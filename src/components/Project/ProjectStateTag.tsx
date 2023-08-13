import { AvatarGroup } from '@mui/material';
import moment from 'moment';
import Image from 'next/image';
import React from 'react';

import freelalncerPic from '@/assets/images/profile-image.png'
import { User } from '@/model';

type StateTagProps = {
    dateCreated: Date;
    text: string;
    voters: User[];
    allApprovers: User[];
}

const ProjectStateTag = ({ dateCreated, text, voters, allApprovers }: StateTagProps) => {
    const pending = text === "Pending";

    return (
        <div className='flex flex-row items-center'>
            <p className='text-sm font-normal leading-[16px] text-content'>
                {moment(dateCreated)?.format('DD MMM, YYYY')}
            </p>
            <p className={`text-sm lg:text-xl ${voters?.length < (allApprovers?.length / 2) ? "text-imbue-coral" : "text-content-primary"} mr-[27px] ml-[14px] flex items-center gap-3`}>
                {
                    !pending
                    ? <p>{voters?.length}/{allApprovers?.length} votes</p>
                    : <p className='text-gray-500 text-opacity-30'>{text}</p>
                }
                {
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
                }
            </p>
        </div>
    );
};

export default ProjectStateTag;