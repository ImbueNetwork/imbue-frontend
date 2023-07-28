import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React from 'react';
import { FiEdit } from 'react-icons/fi';

import { Brief } from '@/model';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

type BioPanelData = {
  brief: Brief;
  projectCategories: string[];
  isOwnerOfBrief?: boolean | null;
};

const BioPanel = ({
  brief,
  projectCategories,
  isOwnerOfBrief,
}: BioPanelData) => {
  const timePosted = timeAgo.format(new Date(brief.created));
  const router = useRouter();
  return (
    <div className='brief-bio py-5 px-10 max-width-750px:!p-5 max-width-750px:!w-full max-width-1100px:p-[1rem] relative'>
      <div className='mb-6'>
        <div className='flex flex-wrap flex-col items-start'>
          <div className='header'>
            <h2 className='text-[1.875rem] text-imbue-purple-dark !font-normal'>
              Brief Details
            </h2>
            <h2 className='!text-[1.25rem] mt-[1.5rem] text-imbue-purple-dark !font-normal'>
              {brief.headline}
            </h2>
          </div>

          {isOwnerOfBrief && !brief?.project_id && (
            <button
              className='primary-btn 
              in-dark w-[auto] 
              max-width-750px:!px-4 
              flex 
              items-center 
              gap-2
              my-4
              !self-start
              '
              onClick={() => {
                router.push(`/briefs/${brief?.id}/edit`);
              }}
            >
              Edit Brief
              <FiEdit size={16} />
            </button>
          )}
        </div>
        <span className='time_posted primary-text !text-imbue-lemon mt-[0.75rem]'>
          Posted {timePosted} by{' '}
          <span
            onClick={() => router.push(`/profile/${brief.user_id}`)}
            className='hover:underline cursor-pointer'
          >
            {brief.created_by}
          </span>
        </span>
      </div>

      <div className='subsection'>
        <h3 className='text-imbue-purple-dark !font-normal'>
          Project Description
        </h3>
        <p className='mt-4 font-normal text-imbue-purple-dark'>
          {brief.description}
        </p>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>
            Project Category
          </h3>
        </div>
        <div className='list-row'>
          {projectCategories?.map((category, index) => (
            <p
              className='rounded-full bg-imbue-light-purple px-4 py-2 text-[0.875rem] text-imbue-purple'
              key={index}
            >
              {category}
            </p>
          ))}
        </div>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>
            Key Skills And Requirements
          </h3>
        </div>
        <div className='list-row'>
          {brief.skills?.map((skill, index) => (
            <p
              className='rounded-full bg-imbue-light-purple px-4 py-2 text-[0.875rem] text-imbue-purple'
              key={index}
            >
              {skill.name}
            </p>
          ))}
        </div>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal !mt-[2rem]'>
            Project Scope
          </h3>
        </div>
        <span className='text-imbue-purple-dark text-[1rem]'>
          {brief.scope_level}
        </span>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>
            Experience Level Required
          </h3>
        </div>
        <span className='text-imbue-purple-dark text-[1rem]'>
          {brief.experience_level}
        </span>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>
            Estimated Length
          </h3>
        </div>
        <span className='text-imbue-purple-dark text-[1rem]'>
          {brief.duration}
        </span>
      </div>

      <div className='subsection'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>Total Budget</h3>
        </div>
        <span className='text-imbue-purple-dark text-[1rem]'>
          ${Number(brief.budget).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default BioPanel;
