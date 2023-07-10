import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Image from 'next/image';
import React from 'react';

import { redirect } from '@/utils';

import { calenderIcon, shieldIcon, tagIcon } from '@/assets/svgs';
import { Brief } from '@/model';
TimeAgo.addDefaultLocale(en);

interface BriefInsightsProps {
  brief: Brief;
}

export const BriefInsights = ({ brief }: BriefInsightsProps) => {
  const timeAgo = new TimeAgo('en-US');
  const timePosted = brief?.created
    ? timeAgo.format(new Date(brief?.created))
    : 0;

  const viewFullBrief = () => {
    redirect(`briefs/${brief.id}/`);
  };

  return (
    <div className='flex mt-[1.5rem] flex-col lg:flex-row gap-4 lg:gap-2 bg-white rounded-bl-[20px] rounded-br-[20px] border-t border-t-[rgba(3, 17, 106, 0.12)] p-7 lg:px-[50px] lg:py-[2rem]'>
      <div className='flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] mr-[5%] relative'>
        <div className='brief-title'>
          <h3 className='text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
            {brief?.headline}
          </h3>
          <span
            className=' text-imbue-lemon cursor-pointer text-base font-bold !m-0 !p-0 relative top-1'
            onClick={viewFullBrief}
          >
            View full brief
          </span>
        </div>
        <div className='text-inactive'>
          <p className=' text-imbue-purple text-[1rem] leading-6'>
            {brief?.description}
          </p>
        </div>
        <p className=' text-imbue-light-purple-two text-xs lg:text-base leading-[1.5] font-bold m-0 p-0'>
          Posted {timePosted}{' '}
        </p>
      </div>
      <div className='flex flex-col mt-3 lg:mt-0 gap-4 lg:gap-8 flex-grow flex-shrink-0 basis-[20%]'>
        <div className='insight-item !gap-[6px]'>
          <Image
            src={shieldIcon}
            alt='shild Icon'
            height={24}
            width={24}
            className='h-fit'
          />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
              {brief?.experience_level}
            </h3>
            <div className='text-[1rem] text-imbue-light-purple-two relative top-[-0.5rem]'>
              Experience Level
            </div>
          </div>
        </div>

        <div className='insight-item  !gap-[6px]'>
          <Image
            src={tagIcon}
            alt='tag Icon'
            height={24}
            width={24}
            className='h-fit'
          />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
              ${Number(brief?.budget).toLocaleString()}
            </h3>
            <div className='text-[1rem] text-imbue-light-purple-two relative top-[-0.5rem]'>
              Fixed Price
            </div>
          </div>
        </div>

        <div className='insight-item  !gap-[6px]'>
          <Image
            src={calenderIcon}
            alt='calender Icon'
            height={24}
            width={24}
            className='h-fit'
          />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-[1.25rem] text-imbue-purple-dark leading-[1.5] font-normal m-0 p-0'>
              {brief?.duration}
            </h3>
            <div className='text-[1rem] text-imbue-light-purple-two relative top-[-0.5rem]'>
              Project length
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
