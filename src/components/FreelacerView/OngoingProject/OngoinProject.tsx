import { Divider } from '@mui/material';
import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import router from 'next/router';

import { ProgressBar } from '@/components/ProgressBar';

import { Project } from '@/model';

interface OnGoinProjectProps {
  projects: any;
}
const timeAgo = new TimeAgo('en-US');
const OngoingProject: React.FC<OnGoinProjectProps> = ({ projects }) => {

  const redirectToApplication = (project: Project) => {
    router.push(
      `/projects/${project.id}`
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
      {projects?.map((project: any, index: number) => (
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
                    titleArray={['', '', '', '']}
                    currentValue={2}
                  />
                </div>
                <p className='text-[#7AA822]'>3/5</p>
                <button
                  className={classNames(
                    ' text-black flex px-5 py-3 text-sm ml-auto rounded-full',
                    !project.completed ? 'bg-light-grey' : 'bg-primary'
                  )}
                >
                  {project.complete ? 'completed' : 'In progress'}
                </button>
              </div>
              <p className='text-imbue-purple-dark text-sm sm:text-lg'>
                {project.name}
              </p>
              <p className='text-xs sm:text-sm'>
                {timeAgo?.format(new Date(project?.created || 0))}
              </p>
            </div>
            <div className='my-7'>
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
      ))}
    </>
  );
};

export default OngoingProject;
