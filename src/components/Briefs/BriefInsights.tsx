import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import { FaDollarSign, FaRegCalendarAlt } from 'react-icons/fa';
import { RiShieldUserLine } from 'react-icons/ri';

import { redirect } from '@/utils';

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
    <div className='flex flex-col lg:flex-row gap-4 lg:gap-2 bg-theme-grey-dark border border-light-white rounded-[20px] p-7 lg:p-[50px]'>
      <div className='flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] mr-[5%]'>
        <div className='brief-title'>
          <h3 className='text-xl leading-[1.5] font-bold m-0 p-0'>
            {brief?.headline}
          </h3>
          <span
            className='text-[#b2ff0b] cursor-pointer text-base font-bold !m-0 !p-0 relative top-1'
            onClick={viewFullBrief}
          >
            View full brief
          </span>
        </div>
        <div className='text-inactive'>
          <p className='text-base'>{brief?.description}</p>
        </div>
        <p className='text-inactive text-xs lg:text-base leading-[1.5] font-bold m-0 p-0'>
          Posted {timePosted}{' '}
        </p>
      </div>
      <div className='flex flex-col mt-3 lg:mt-0 gap-4 lg:gap-8 flex-grow flex-shrink-0 basis-[20%]'>
        <div className='insight-item'>
          <RiShieldUserLine color='var(--theme-white)' size={24} />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0'>
              {brief?.experience_level}
            </h3>
            <div className='text-inactive'>Experience Level</div>
          </div>
        </div>
        <div className='insight-item'>
          <FaDollarSign color='var(--theme-white)' size={24} />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0'>
              ${Number(brief?.budget).toLocaleString()}
            </h3>
            <div className='text-inactive'>Fixed Price</div>
          </div>
        </div>
        <div className='insight-item'>
          <FaRegCalendarAlt color='var(--theme-white)' size={24} />
          <div className='insight-value'>
            <h3 className='text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0'>
              {brief?.duration}
            </h3>
            <div className='text-inactive'>Project length</div>
          </div>
        </div>
      </div>
    </div>
  );
};
