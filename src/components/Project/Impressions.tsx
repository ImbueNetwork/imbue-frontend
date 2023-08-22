import { Skeleton, Typography } from '@mui/material';
import React from 'react';

import { Milestone } from '@/model';

const Impressions = ({
  isChainLoading,
  numberOfMileSotnes,
  onChainProject,
  firstPendingMilestone,
  projectInMilestoneVoting,
  setOpenVotingList,
}: any) => {
  // const votedYes: User[] = []
  // const votedNo: User[] = []
  // const pendingVote: User[] = []

  // approversPreview.forEach((approver:any) => {
  //     const match = votes?.find((voter:any) => voter?.voterAddress === approver.web3_address)
  //     if (!approver.web3_address) return

  //     if (match) {
  //         if (match?.vote) votedYes.push(approver)
  //         else if (!match?.vote) votedNo.push(approver)
  //     }
  //     else pendingVote.push(approver)
  // })

  return (
    <div className='bg-background rounded-3xl h-full w-full col-span-3 py-6 px-12'>
      <p className='text-content border-b pb-2 text-2xl mb-6'>Impressions</p>
      {!isChainLoading &&
        numberOfMileSotnes?.map((item: any) => (
          <div
            key={'impression__' + item}
            className='h-6 items-center justify-between flex w-full my-6'
          >
            <Typography variant='h5' className='w-28'>
              <Skeleton />
            </Typography>
            <Typography variant='body1' className='w-20'>
              <Skeleton />
            </Typography>
          </div>
        ))}

      {!isChainLoading &&
        onChainProject?.milestones?.map?.(
          (milestone: Milestone, index: number) => {
            //TODO: const votedCount =
            return (
              <div
                key={index}
                className='flex items-center justify-between mb-8'
              >
                <div className='flex items-center gap-3'>
                  <p className='text-xl text-content-primary'>
                    Milestone {index + 1}
                  </p>
                  {/* {
                                        (votedYes?.length) && (
                                            <AvatarGroup spacing={8} max={5}>
                                                {
                                                    votedYes.map((approver: any) => {
                                                        //TODO: if(approver Has voted)
                                                        return (
                                                            <div key={approver.id} className='w-6 h-6 rounded-full overflow-hidden border border-black'>
                                                                <Image height={100} width={100} className='h-full w-full object-cover' src={approver?.profile_photo || freelalncerPic} alt="" />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </AvatarGroup>
                                        )
                                    } */}
                </div>
                <div className='text-xl text-content flex flex-wrap items-center'>
                  {firstPendingMilestone !== undefined &&
                  milestone?.milestone_key <= firstPendingMilestone &&
                  projectInMilestoneVoting ? (
                    <>
                      {milestone.is_approved ? (
                        <p className='text-lg cursor-pointer !text-content-primary'>
                          Completed
                        </p>
                      ) : (
                        <p
                          onClick={() => setOpenVotingList(true)}
                          className='text-lg cursor-pointer'
                        >
                          Votes
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {milestone.is_approved ? (
                        <p className='text-lg cursor-pointer !text-content-primary'>
                          Completed
                        </p>
                      ) : (
                        <p className='text-gray-500 text-opacity-30 cursor-pointer'>
                          Pending
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          }
        )}
    </div>
  );
};

export default Impressions;
