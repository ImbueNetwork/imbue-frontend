import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { Divider } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ProgressBar } from '@/components/ProgressBar';

import { applicationStatusId, Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function Myprojects() {
  const [switcher, setSwitcher] = useState('completed');
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);

      try {
        switch (switcher) {
          case 'completed': {
            const projects = await getFreelancerApplications(user.id);
            const projectRes = projects.filter((item) => item.completed);
            setProjects(projectRes);
            break;
          }
          case 'active': {
            const projects = await getFreelancerApplications(user.id);
            const projectRes = projects.filter((item) => item.chain_project_id && !item.completed && item.brief_id);
            setProjects(projectRes);
            break;
          }
          case 'pending': {
            const projects = await getFreelancerApplications(user.id);
            const projectRes = projects.filter((item) => !item.chain_project_id && item.status_id === 4);
            setProjects(projectRes);
            break;
          }
          case 'grants': {
            const projects = await getFreelancerApplications(user.id);
            const projectRes = projects.filter((item) => !item.brief_id && item.status_id === 4);
            setProjects(projectRes);
            break;
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) getProjects();
  }, [switcher, user.id]);

  const router = useRouter()

  const redirectToApplication = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className='bg-white rounded-3xl overflow-hidden pt-5 relative'>
      <div
        onClick={() => router.back()}
        className='border border-content group hover:bg-content rounded-full flex items-center justify-center cursor-pointer absolute left-5 top-10'
      >
        <ArrowBackIcon className='h-7 w-7 group-hover:text-white' color='secondary' />
      </div>

      <div className='mx-2 border justify-between rounded-3xl flex cursor-pointer'>
        <p
          onClick={() => setSwitcher('completed')}
          className='text-2xl text-black py-5 border-r text-center w-full  '
        >
          Completed Projects
        </p>
        <p
          onClick={() => setSwitcher('active')}
          className='text-2xl text-black py-5 border-r text-center w-full'
        >
          Active Projects
        </p>
        <p
          onClick={() => setSwitcher('pending')}
          className='text-2xl text-black border-r py-5 text-center w-full'
        >
          Pending Projects
        </p>
        <p
          onClick={() => setSwitcher('grants')}
          className='text-2xl text-black py-5 text-center w-full'
        >
          Grants
        </p>
      </div>
      <div className='mt-5 min-h-[300px]'>
        {
          (loadingUser || loading) && <p className='p-10 text-black'>Loading...</p>
        }
        {
          !(loadingUser || loading) && projects.map((project, index) => (
            <>
              <div
                key={project.id}
                onClick={() => redirectToApplication(project)}
                className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'
              >
                <div className='flex flex-col pt-7 gap-y-5 '>
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
                    <p>${project.required_funds}</p>
                    <p>Fixed price</p>
                  </div>
                </div>
              </div>
              {index !== projects.length - 1 && <Divider />}
            </>
          ))
        }
      </div>
    </div>
  );
}
