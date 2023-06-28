/* eslint-disable react-hooks/exhaustive-deps */
import Image from 'next/image';
import React from 'react';
import { FaPaperclip } from 'react-icons/fa';

import { ApplicationContainerProps } from '@/model';

export const ApplicationContainer = ({
  application,
  redirectToApplication,
  handleMessageBoxClick,
}: ApplicationContainerProps) => {
  return (
    <div className='flex flex-col p-[20px] lg:px-[60px] lg:py-[35px] border-b border-b-light-white last:border-b-0'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-5'>
          <Image
            src={require('@/assets/images/profile-image.png')}
            className='h-[45px] w-[45px] lg:h-[60px] lg:w-[60px]  object-cover'
            alt={'profile-picture'}
            height={45}
            width={45}
          />

          <div className='user-id text-primary text-[10px] lg:text-base max-w-[100px] lg:max-w-full break-words'>
            @{application?.freelancer?.username}
          </div>
        </div>
        <div className='ctas-container flex flex-col lg:flex-row gap-2'>
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
            className='primary-btn in-dark w-button'
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
            className='secondary-btn in-dark w-button'
          >
            Message
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

        <div className='flex flex-row items-center justify-between'>
          <div className='font-bold text-white text-base w-[fit-content] max-w-[320px]'>
            {application?.freelancer?.title}
          </div>
        </div>

        <div className='text-base font-bold'>{application?.name}</div>
        <div className='text-base'>
          <div>
            <span className='font-bold '>Cover Letter - </span>
            {/* TODO: Implement cover letters */}
            {/* {application.freelancer.bio
                                            .split("\n")
                                            .map((line, index) => (
                                                <span key={index}>{line}</span>
                                            ))} */}
            Hello, I would like to help you! I have 4+ years Experience with web
            3, so i’ll make things work properly. Feel free to communicate!
          </div>
        </div>

        <div className='flex items-center lg:items-start lg:justify-between'>
          <div className='text-base'>
            <h3 className='text-base'>Attachment(s)</h3>
            <div className='flex py-3 gap-2'>
              {/* TODO: Implement */}
              <FaPaperclip color='#b2ff0b' />
              <div className='text-[#ffffff80] w-4/5 lg:w-full text-xs lg:text-[16px] break-words'>
                https://www.behance.net/abbioty
              </div>
            </div>
          </div>
          <div>
            <div className='flex gap-2 flex-col items-center'>
              <span className='font-bold text-primary text-xs lg:text-base'>
                Milestones ({application?.milestones?.length})
              </span>
              <div className='text-[#ffffff80] text-[16px]'>
                ${Number(application?.required_funds).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
