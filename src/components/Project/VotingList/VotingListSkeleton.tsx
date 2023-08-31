import { Skeleton } from '@mui/material';
import React from 'react';

const VotingListSkeleton = () => {
    return (
        <div className='mx-5 my-auto'>
            <Skeleton className='rounded-lg mb-8' variant="rectangular" animation='wave' width="100%">
                <div className='h-10' />
            </Skeleton>

            <div className='flex flex-col gap-5'>
                {
                    [1, 2, 3].map(v => (
                        <div key={v} className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 w-5/6'>
                                <Skeleton variant="circular" animation='wave' width={35} height={35} />
                                <Skeleton className='text-base w-1/2' animation='wave' variant="text" />
                            </div>
                            <Skeleton className='text-base w-20' animation='wave' variant="text" />
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default VotingListSkeleton;