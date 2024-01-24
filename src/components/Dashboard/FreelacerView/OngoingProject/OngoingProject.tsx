import { Divider } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';
import { useState } from 'react';

import { ProgressBar } from '@/components/ProgressBar';

import { applicationStatusId, Currency, Project } from '@/model';

interface OngoingProjectProps {
  projects: Project[];
}

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

const OngoingProject: React.FC<OngoingProjectProps> = ({ projects }) => {
  /// limit ongoing project
  const OngoingProjectLimit = 10;
  const [value, setValue] = useState(OngoingProjectLimit);
  // const redirectToApplication = (project: Project) => {
  //   router.push(`/projects/${project.id}`);
  // };

  // const redirectToDiscoverBriefs = () => {
  //   router.push(`/briefs`);
  // };

  if (projects?.length === 0)
    return (
      <div className='w-full flex justify-center py-6'>
        <button
          // onClick={() => {
          //   redirectToDiscoverBriefs();
          // }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          <Link
            href={'/briefs'}
          >
            Discover Briefs
          </Link>
        </button>
      </div>
    );
  return (
    <>
      {projects?.map(
        (project, index: number) =>
          index <
          Math.min(Math.max(value, OngoingProjectLimit), projects.length) && (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
            >
              <div
                // onClick={() => redirectToApplication(project)}
                className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'
              >
                <div className='flex flex-col lg:pt-7 gap-y-5 '>
                  <div className='flex gap-x-3 items-center'>
                    {project.milestones && (
                      <>
                        <div className='w-48'>
                          <ProgressBar
                            isPrimary={true}
                            titleArray={Array(
                              project.milestones?.length + 1
                            ).fill('')}
                            currentValue={
                              project.milestones?.filter(
                                (it: any) => it.is_approved === true
                              ).length
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
                      </>
                    )}
                    {
                      project.status_id && (<button
                        className={`${applicationStatusId[project.status_id]
                          }-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[10px]`}
                      >
                        {applicationStatusId[project.status_id]}
                      </button>)
                    }

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
                    <p>{project.required_funds} ${Currency[project.currency_id]}</p>
                    <p>Fixed price</p>
                  </div>
                </div>
              </div>
              {index !== projects.length - 1 && <Divider />}
            </Link>
          )
      )}
      <div className='flex'>
        {value < projects.length && (
          <div className='flex w-full justify-center my-7 items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value + OngoingProjectLimit);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                load more
              </button>
            </div>
          </div>
        )}
        {value > OngoingProjectLimit && projects.length > OngoingProjectLimit && (
          <div className='flex w-full justify-center my-7 items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value - OngoingProjectLimit);
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
