import React, { useState } from 'react';
import styles from '@/styles/modules/freelancers.module.css'
import { useWindowSize } from "@/hooks";
import { Skeleton } from '@mui/material';


export default function LoadingFreelancers() {
    const size = useWindowSize();

    return (
        <div className="px-[15px] lg:px-[40px] freelancer">
            <div className={`${styles.freelancersContainer} max-width-1100px:!m-0`}>
                    <div
                        className={`${styles.filterPanel}`}
                        style={{
                            display:
                                size?.width <= 750 ? "none" : "block",
                        }}
                    >
                        <Skeleton className='text-xl w-2/3' />
                        <Skeleton className='text-xl w-1/3' />

                       {
                        [1,2,3].map((k)=>(
                            <div key={k} className='mt-7  flex flex-col gap-2'>
                                <Skeleton className='h-5 w-1/4' />
                                {
                                    [1, 2, 3].map((v) => (
                                        <div key={v} className='flex items-center gap-2'>
                                            <Skeleton className='text-xl w-[20px]' />
                                            <Skeleton className={`h-5 w-1/3`} />
                                        </div>
                                    ))
                                }
                            </div>
                           ))
                       }
                    </div>

                    <div className={`${styles.freelancersView} max-width-750px:!w-full`}>
                        <div className={`my-[30px] ml-[20px] max-width-750px:!mx-0`}>
                            <div className={`${styles.tabSection} w-full justify-between`}>
                                <Skeleton className='text-xl w-1/4' />
                            </div>
                            <Skeleton className={`h-14`} />
                            <div className="search-result">
                                <Skeleton className='text-xl w-1/2' />

                            </div>
                        </div>
                        <div className={`${styles.freelancers} max-width-750px:!px-0`}>
                            {[1, 2, 3].map((value, index) => (
                                <div className={styles.freelancer} key={index}>
                                    <div className={styles.freelancerImageContainer}>
                                        <Skeleton
                                            className={styles.freelancerProfilePic}
                                            variant="circular"
                                        />
                                    </div>
                                    <div className={styles.freelancerInfo}>
                                        <Skeleton
                                            height={20}
                                            width="40%"
                                            style={{ marginBottom: 6 }}
                                        />
                                        <Skeleton
                                            height={20}
                                            width="80%"
                                            style={{ marginBottom: 6 }}
                                        />
                                        <div className='flex flex-wrap'>
                                            <Skeleton className='px-2 py-4 w-2/6 h-4' />
                                            <Skeleton className='px-2 py-4 w-3/6 h-4 ml-2' />
                                            <Skeleton className='px-2 py-4 w-1/2 h-4' />
                                        </div>
                                    </div>
                                    <Skeleton className='w-1/2 h-14 mx-auto' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
    )
}