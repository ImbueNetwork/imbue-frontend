import VerifiedIcon from '@mui/icons-material/Verified';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FiEdit } from 'react-icons/fi';

import { Brief } from '@/model';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

type BioPanelData = {
  brief: Brief;
  projectCategories: string[];
  isOwnerOfBrief?: boolean | null;
  targetUser: any;
};

const BioPanel = ({
  brief,
  projectCategories,
  isOwnerOfBrief,
  targetUser,
}: BioPanelData) => {
  const [expandBreifDesc, setExpandBreifDesc] = useState<number>(500);
  const timePosted = timeAgo.format(new Date(brief.created));
  const router = useRouter();
  return (
    <div className='brief-bio py-5 px-10 max-width-750px:!p-5 max-width-750px:!w-full max-width-1100px:p-[1rem] relative'>
      <div className='mb-6'>
        <div className='flex flex-wrap flex-col items-start mb-1'>
          <div className='header'>
            {brief.verified_only && (
              <p className='text-imbue-purple flex items-center  mb-1.5'>
                <VerifiedIcon className='text-base mr-2' />
                only verified freelancer can apply
              </p>
            )}
            <p className='!text-3xl text-imbue-purple-dark !font-normal'>
              {brief.headline}
            </p>
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
                router.replace(`/briefs/${brief?.id}/edit`);
              }}
            >
              Edit Brief
              <FiEdit size={16} />
            </button>
          )}
        </div>
        <span className='text-sm primary-text !text-imbue-lemon'>
          Posted {timePosted} by{' '}
          <span
            onClick={() => router.push(`/profile/${targetUser.username}`)}
            className='hover:underline cursor-pointer'
          >
            {brief.created_by}
          </span>
        </span>
      </div>

      <div className='subsection break-all'>
        <h3 className='text-imbue-purple-dark !font-normal'>
          Project Description
        </h3>
        <p className='mt-4 text-imbue-purple-dark whitespace-pre-wrap !leading-normal'>
          {brief.description.length > expandBreifDesc
            ? brief.description.substring(0, expandBreifDesc) + ' ...'
            : brief.description}
          {brief.description.length > 500 && (
            <span>
              {brief.description.length > expandBreifDesc ? (
                <button
                  onClick={() => setExpandBreifDesc((prev) => prev + 500)}
                  className='ml-3 w-fit text-sm hover:underline text-imbue-lemon'
                >
                  Show more
                </button>
              ) : (
                <button
                  onClick={() => setExpandBreifDesc(500)}
                  className='ml-3 w-fit text-sm hover:underline text-imbue-lemon'
                >
                  Show Less
                </button>
              )}
            </span>
          )}
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
