import { Divider } from '@mui/material';
import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import router from 'next/router';
import { useState } from 'react';

import { ProgressBar } from '@/components/ProgressBar';

import { Project } from '@/model';

interface OnGoinProjectProps {
  projects: Project[];
}

const timeAgo = new TimeAgo('en-US');
const OngoingProject: React.FC<OnGoinProjectProps> = ({ projects }) => {
  const [value, setValue] = useState(10);
  const redirectToApplication = (application: Project) => {
    router.push(
      `/briefs/${application.brief_id}/applications/${application.id}/`
    );
  };

  const redirectToDiscoverBriefs = () => {
    router.push(`/briefs`);
  };
  if (projects?.length === 0)
    return (
      <div className='w-full flex justify-center py-6'>
        <button
          onClick={() => {
            redirectToDiscoverBriefs();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          Discover Briefs
        </button>
      </div>
    );

  return (
    <>
      {projects?.map(
        (item: any, index: number) =>
          index < Math.min(value, projects.length) && (
            <>
              <div
                key={item.id}
                onClick={() => redirectToApplication(item)}
                className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'
              >
                <div className='flex flex-col pt-7 gap-y-5 '>
                  <div className='flex gap-x-3 items-center'>
                    <div className='w-48'>
                      <ProgressBar
                        isPrimary={true}
                        titleArray={['', '', '', '']}
                        currentValue={2}
                      />
                    </div>
                    <p className='text-[#7AA822]'>3/4</p>
                    <button
                      className={classNames(
                        ' text-black flex px-5 py-3 text-sm ml-auto rounded-full',
                        !item.completed ? 'bg-light-grey' : 'bg-primary'
                      )}
                    >
                      {item.complete ? 'completed' : 'In progress'}
                    </button>
                  </div>
                  <p className='text-imbue-purple-dark text-sm sm:text-lg'>
                    {item.name}
                  </p>
                  <p className='text-xs sm:text-sm'>
                    {timeAgo?.format(new Date(item?.created || 0))}
                  </p>
                </div>
                <div className='my-7'>
                  <p className='text-sm line-clamp-2 md:line-clamp-3 lg:line-clamp-4'>
                    {item.description}
                  </p>
                </div>
                <div className='flex pb-9 justify-between'>
                  <div className='flex space-x-5 text-sm text-imbue-purple-dark'>
                    <p>${item.required_funds}</p>
                    <p>Fixed price</p>
                  </div>
                </div>
              </div>
              {index !== projects.length - 1 && <Divider />}
            </>
          )
      )}
      {value < projects.length && (
        <div className='flex justify-center my-7 items-center '>
          <div className='w-full flex justify-center py-6'>
            <button
              onClick={() => {
                setValue((value) => value + 10);
              }}
              className='primary-btn in-dark w-button lg:w-1/3'
              style={{ textAlign: 'center' }}
            >
              load more
            </button>
          </div>
        </div>
      )}
      {value > projects.length && projects.length > 10 && (
        <div className='flex justify-center my-7 items-center '>
          <div className='w-full flex justify-center py-6'>
            <button
              onClick={() => {
                setValue(10);
              }}
              className='primary-btn in-dark w-button lg:w-1/3'
              style={{ textAlign: 'center' }}
            >
              show less
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OngoingProject;
