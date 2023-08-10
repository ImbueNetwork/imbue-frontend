import { Divider } from '@mui/material';
import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import router from 'next/router';
import { useState } from 'react';

import { ProgressBar } from '@/components/ProgressBar';

import { Project } from '@/model';

interface OnGoinProjectProps {
  projects: Project[];
}

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

const OngoingProject: React.FC<OnGoinProjectProps> = ({ projects }) => {
  /// limit ongoing project
  const ongoinProjectLimit = 10;
  const [value, setValue] = useState(ongoinProjectLimit);
  const redirectToApplication = (project: Project) => {
    router.push(`/projects/${project.id}`);
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
        (project, index: number) =>
          index <
            Math.min(Math.max(value, ongoinProjectLimit), projects.length) && (
            <>
              <div
                key={project.id}
                onClick={() => redirectToApplication(project)}
                className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'
              >
                <div className='flex flex-col pt-7 gap-y-5 '>
                  <div className='flex gap-x-3 items-center'>
                    <div className='w-48'>
                      <ProgressBar
                        isPrimary={true}
                        titleArray={Array(project.milestones?.length).fill('')}
                        currentValue={
                          project?.milestones?.filter(
                            (it: any) => it.is_approved === true
                          ).length - 1
                        }
                      />
                    </div>
                    <p className='text-[#7AA822]'>
                      {
                        project.milestones?.filter(
                          (it: any) => it.is_approved === true
                        ).length
                      }
                      /{project.milestones?.length}
                    </p>
                    <button
                      className={classNames(
                        ' text-black flex px-5 py-3 text-sm ml-auto rounded-full',
                        !project.completed ? 'bg-light-grey' : 'bg-primary'
                      )}
                    >
                      {project.completed ? 'completed' : 'In progress'}
                    </button>
                  </div>
                  <p className='text-imbue-purple-dark text-sm sm:text-lg'>
                    {project.name}
                  </p>
                  <p className='text-xs sm:text-sm'>
                    {timeAgo?.format(new Date(project?.created || 0))}
                  </p>
                </div>
                <div className='my-7 break-all'>
                  <p className='text-sm line-clamp-2 md:line-clamp-3 lg:line-clamp-4'>
                    {project.description}
                  </p>
                </div>
                <div className='flex pb-9 justify-between'>
                  <div className='flex space-x-5 text-sm text-imbue-purple-dark'>
                    <p>${project.required_funds}</p>
                    <p>Fixed price</p>
                  </div>
                </div>
              </div>
              {index !== projects.length - 1 && <Divider />}
            </>
          )
      )}
      <div className='flex'>
        {value < projects.length && (
          <div className='flex w-full justify-center my-7 items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value + ongoinProjectLimit);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                load more
              </button>
            </div>
          </div>
        )}
        {value > ongoinProjectLimit && projects.length > ongoinProjectLimit && (
          <div className='flex w-full justify-center my-7 items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value - ongoinProjectLimit);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                show less
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OngoingProject;
