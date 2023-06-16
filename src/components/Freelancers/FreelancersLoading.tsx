import { Skeleton } from '@mui/material';
import React from 'react';

import styles from '@/styles/modules/freelancers.module.css';

export default function LoadingFreelancers() {
  return (
    <div className='px-[15px] lg:px-[40px] freelancer'>
      <div className={`${styles.freelancersContainer} max-width-1100px:!m-0`}>
        <div className={`${styles.freelancersView} max-width-750px:!w-full`}>
          <div className={`my-[30px] ml-[20px] max-width-750px:!mx-0`}>
            <div className={`${styles.tabSection} w-full justify-between`}>
              <Skeleton className='text-xl w-1/4' />
            </div>
            <Skeleton className={`h-14 w-2/3`} />
            <div className='search-result'>
              <Skeleton className='text-xl w-1/3' />
            </div>
          </div>
          <div className={`${styles.freelancers} max-width-750px:!px-0`}>
            {[1, 2, 3].map((value, index) => (
              <div className={styles.freelancer} key={index}>
                <div className={styles.freelancerImageContainer}>
                  <Skeleton
                    className={styles.freelancerProfilePic}
                    variant='circular'
                  />
                </div>
                <div className={styles.freelancerInfo}>
                  <Skeleton
                    height={20}
                    width='40%'
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton
                    height={20}
                    width='80%'
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
  );
}
