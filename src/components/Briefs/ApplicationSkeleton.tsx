import { Skeleton } from '@mui/material';
import React from 'react';

const ApplicationSkeleton = () => {
    return (
        <div className='bg-white overflow-hidden rounded-xl'>
            {[1, 2].map((v, i) => (
                <div
                    key={i}
                    className='w-full px-5 py-3 lg:px-10 lg:py-8 border-b last:border-b-0 border-b-imbue-light-purple'
                >
                    <div className='flex justify-between items-center'>
                        <div className='flex w-full items-center gap-4'>
                            <Skeleton
                                className='w-16 h-16'
                                variant='circular'
                                sx={{ fontSize: '1rem' }}
                            />
                            <Skeleton
                                className='w-1/6 h-7'
                                variant='text'
                                sx={{ fontSize: '1rem' }}
                            />
                        </div>
                        <Skeleton
                            className='w-1/6 h-7'
                            variant='text'
                            sx={{ fontSize: '1rem' }}
                        />
                    </div>
                    <div className='flex justify-between'>
                        <Skeleton
                            className='w-5/6'
                            variant='text'
                            sx={{ fontSize: '1rem' }}
                        />
                        <Skeleton
                            className='w-1/12'
                            variant='text'
                            sx={{ fontSize: '1rem' }}
                        />
                    </div>
                    <Skeleton
                        className='w-3/5'
                        variant='text'
                        sx={{ fontSize: '1rem' }}
                    />
                    <Skeleton
                        className='w-1/12'
                        variant='text'
                        sx={{ fontSize: '1rem' }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ApplicationSkeleton;