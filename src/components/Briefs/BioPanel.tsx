import MoreVertIcon from '@mui/icons-material/MoreVert';
import VerifiedIcon from '@mui/icons-material/Verified';
import { IconButton, Menu, MenuItem, Skeleton } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Brief, User } from '@/model';

import { LoginPopupStateType } from '../Layout';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

type BioPanelData = {
  brief: Brief;
  projectCategories: string[];
  isOwnerOfBrief?: boolean | null;
  targetUser: any;
  browsingUser: User;
  showLoginPopUp: (_value: LoginPopupStateType) => void;
  loadingMain: boolean;
};

const BioPanel = ({
  brief,
  projectCategories,
  isOwnerOfBrief,
  targetUser,
  browsingUser,
  showLoginPopUp,
  loadingMain
}: BioPanelData) => {
  const [expandBreifDesc, setExpandBreifDesc] = useState<number>(500);
  const timePosted = timeAgo.format(new Date(brief.created));
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (loadingMain) return (
    <div className='brief-bio py-5 px-10 max-width-750px:!p-5 max-width-750px:!w-full max-width-1100px:p-[1rem] relative'>
      <Skeleton variant="text" className='text-2xl w-2/3 mt-5' />
      <Skeleton variant="text" className='text-sm w-1/5' />

      <div className='subsection'>
        <Skeleton variant="text" className='text-base w-40 mb-3' />
        <Skeleton variant="rounded" height={130} className='text-base w-full mb-3' />
      </div>

      <Skeleton variant="text" className='text-base w-52 mt-6' />
      <div className='flex gap-2 w-full my-3'>
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
      </div>

      <Skeleton variant="text" className='text-base w-52 mt-6' />
      <div className='flex gap-2 w-full my-3'>
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
      </div>

      <Skeleton variant="text" className='text-base w-52 mt-5' />
      <Skeleton variant="text" className='text-base w-40 mt-1' />

      <Skeleton variant="text" className='text-base w-52 mt-5' />
      <Skeleton variant="text" className='text-base w-40 mt-1' />

      <Skeleton variant="text" className='text-base w-52 mt-5' />
      <Skeleton variant="text" className='text-base w-40 mt-1' />
    </div>
  )

  return (
    <div className='brief-bio py-5 px-10 max-width-750px:!p-5 max-width-750px:!w-full max-width-1100px:p-[1rem] relative'>
      <div className='mb-6'>
        <div className='flex flex-wrap flex-col items-start mb-1 relative'>
          {
            isOwnerOfBrief && !brief?.project_id && (
              <div className='absolute top-5 right-0'>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    'aria-labelledby': 'long-button',
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    style: {
                      maxHeight: 48 * 4.5,
                      width: '20ch',
                    },
                  }}
                >
                  <Link href={`/briefs/${brief?.id}/edit`}>
                    <MenuItem onClick={handleClose}>
                      Edit Brief
                    </MenuItem>
                  </Link>
                  
                  <MenuItem onClick={handleClose}>
                    Delete Brief
                  </MenuItem>
                </Menu>
              </div>
            )
          }

          <div className='header relative'>
            {
              brief.verified_only && (
                <p className='text-imbue-purple flex items-center  mb-1.5'>
                  <VerifiedIcon className='text-base mr-2' />
                  only verified freelancer can apply
                </p>
              )
            }
            <p className='!text-3xl text-imbue-purple-dark !font-normal'>
              {brief.headline}
            </p>
          </div>

          {/* {isOwnerOfBrief && !brief?.project_id && (
            <div className='flex'>
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
            </div>
          )} */}
        </div>
        <span className='text-sm primary-text !text-imbue-lemon'>
          Posted {timePosted} by{' '}
          <span
            onClick={() =>
              browsingUser?.id
                ? router.push(`/profile/${targetUser.username}`)
                : showLoginPopUp({ open: true, redirectURL: `/profile/${targetUser.username}` })
            }
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
    </div >
  );
};

export default BioPanel;
