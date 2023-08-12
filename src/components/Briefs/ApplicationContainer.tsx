/* eslint-disable react-hooks/exhaustive-deps */
import Image from 'next/image';
import React from 'react';

// import { FaPaperclip } from 'react-icons/fa';
import { ApplicationContainerProps, applicationStatusId } from '@/model';

export const ApplicationContainer = ({
  application,
  redirectToApplication,
  handleMessageBoxClick,
}: ApplicationContainerProps) => {
  return (
    <div className='flex flex-col px-5 py-5 lg:px-[60px] lg:py-[35px] border-b border-b-imbue-light-purple last:border-b-0 hover:bg-imbue-light-purple-hover cursor-pointer'>
      <div className='flex flex-col gap-5 lg:flex-row lg:items-center justify-between mb-4'>
        <div className='flex items-start gap-5 ml-4 lg:ml-0'>
          <Image
            src={application?.freelancer?.profile_image ?? require('@/assets/images/profile-image.png')}
            className='h-[60px] w-[60px] object-cover rounded-full'
            alt={'profile-picture'}
            height={70}
            width={70}
          />

          <div className='user-id text-content max-w-[70%] lg:max-w-full flex flex-col gap-2'>
            <span className='text-lg'>{application?.freelancer?.display_name}</span>
            <span className='text-sm text-content-primary break-words'>@{application?.freelancer?.username}</span>
            <span className='text-sm w-[fit-content]'>{application?.freelancer?.title}</span>
          </div>
        </div>
        <div className='ctas-container flex flex-row flex-wrap gap-2 pb-4'>
          {/* TODO: Like/unlike feature. On hold */}
          {/* <div className="cta-votes">
                                            <div className="cta-vote">
                                                <FaRegThumbsUp />
                                                Yes
                                            </div>
                                            <div className="cta-vote">
                                                <FaRegThumbsDown />
                                                No
                                            </div>
                                        </div> */}


          <button
            className='border border-imbue-purple rounded-full px-5 text-imbue-purple hover:bg-primary hover:border-primary font-medium py-[6px] md:py-2 !text-sm lg:!text-base'
            onClick={() => redirectToApplication(application?.id)}
          >
            View proposal
          </button>
          <button
            onClick={() =>
              handleMessageBoxClick(
                application?.user_id,
                application?.freelancer
              )
            }
            className='primary-btn in-dark w-button !px-5 !text-sm lg:!text-base'
          >
            Message
          </button>
          <button
            className={`${applicationStatusId[application?.status_id]
              }-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[10px]`}
          >
            {applicationStatusId[application?.status_id]}
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-[10px] grow'>
        <div className='flex flex-row items-center'>
          {/* <div className="country">
                        <div className="country-flag">
                            <ReactCountryFlag countryCode="us" />
                        </div>
                        <div className="country-name text-grey">
                            United States
                        </div>
                    </div> */}
        </div>

        <p className='text-xl text-content'>
          {application?.name}
        </p>
        <p className='text-base text-content'>
          {
            application?.description?.length > 500
              ? application?.description.substring(0, 500) + "..."
              : application.description
          }
        </p>
        <div className='text-base'>
          {/* <div className='text-imbue-purple-dark'>
            <span className=''>Cover Letter - </span>
            {/* {application.freelancer.bio
                                            .split("\n")
                                            .map((line, index) => (
                                                <span key={index}>{line}</span>
                                            ))} }
            Hello, I would like to help you! I have 4+ years Experience with web
            3, so i’ll make things work properly. Feel free to communicate!
          </div> */}
        </div>

        <div className='flex items-center lg:items-start lg:justify-between'>
          <div className='text-base'>
            {/* <p className='text-base text-imbue-purple-dark'>Attachment(s)</p> */}
            <div className='flex py-3 gap-2'>
              {/* <FaPaperclip color='#b2ff0b' />
              <div className='text-imbue-purple w-4/5 lg:w-full text-xs lg:text-[16px] break-words'>
                https://www.behance.net/abbioty
              </div> */}
            </div>
          </div>
          <div>
            <div className='flex gap-2 flex-col lg:items-center'>
              <span className='text-imbue-purple-dark text-xs lg:text-base'>
                Milestones ({application?.milestones?.length})
              </span>
              <div className='text-imbue-purple text-[16px]'>
                ${Number(application?.required_funds).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
