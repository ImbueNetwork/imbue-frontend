import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { Divider } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ProgressBar } from '@/components/ProgressBar';

import { applicationStatusId, Currency, Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function Myprojects() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allProject, setAllProjects] = useState({
    completed: 0,
    active: 0,
    pending: 0,
    grants: 0,
  });
  const [switcher, SwitchWindow] = useState('completed');

  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);
      try {
        const projects = await getFreelancerApplications(user.id);
        const completedProject = projects.filter((item) => item.completed);
        setAllProjects((val) => {
          return {
            ...val,
            completed: completedProject.length,
          };
        });
        const activeProject = projects.filter(
          (item) => item.chain_project_id && !item.completed && item.brief_id
        );
        setAllProjects((val) => {
          return {
            ...val,
            active: activeProject.length,
          };
        });
        const pendingProject = projects.filter(
          (item) => !item.chain_project_id && item.status_id === 4
        );
        setAllProjects((val) => {
          return {
            ...val,
            pending: pendingProject.length,
          };
        });
        const GrantProject = projects.filter(
          (item) => !item.brief_id && item.status_id === 4
        );
        setAllProjects((val) => {
          return {
            ...val,
            grants: GrantProject.length,
          };
        });

        switch (switcher) {
          case 'completed': {
            setProjects(completedProject);
            break;
          }
          case 'active': {
            setProjects(activeProject);
            break;
          }
          case 'pending': {
            setProjects(pendingProject);
            break;
          }
          case 'grants': {
            setProjects(GrantProject);
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
  }, [user.id, switcher]);

  const router = useRouter();

  // const redirectToApplication = (project: Project) => {
  //   router.push(`/projects/${project.id}`);
  // };

  return (
    <div className='bg-white rounded-3xl overflow-hidden pt-5 relative'>
      <div className='flex items-center'>
        <div
          onClick={() => router.back()}
          className='border border-content group hover:bg-content rounded-full flex items-center justify-center cursor-pointer ml-2 lg:ml-5'
        >
          <ArrowBackIcon
            className='w-6 h-6 lg:h-7 lg:w-7 group-hover:text-white'
            color='secondary'
          />
        </div>

        <div className='mx-2 w-full border justify-between rounded-3xl flex cursor-pointer'>
          <p
            onClick={() => SwitchWindow('completed')}
            className='text-xs lg:text-2xl text-black py-5 border-r text-center w-full  '
          >
            Completed Projects({allProject?.completed || 0})
          </p>
          <p
            onClick={() => SwitchWindow('active')}
            className='text-xs lg:text-2xl text-black py-5 border-r text-center w-full'
          >
            Active Projects ({allProject.active || 0})
          </p>
          <p
            onClick={() => SwitchWindow('pending')}
            className='text-xs lg:text-2xl text-black border-r py-5 text-center w-full'
          >
            Pending Projects ({allProject.pending || 0})
          </p>
          <p
            onClick={() => SwitchWindow('grants')}
            className='text-xs lg:text-2xl text-black py-5 text-center w-full my-auto'
          >
            Grants ({allProject.grants || 0})
          </p>
        </div>
      </div>
      <div className='mt-5'>
        {
          (loadingUser || loading)
            ? <p className='p-10 text-black'>Loading...</p>
            : !projects?.length
              ? (
                <div className='flex justify-center w-full my-10 lg:my-20'>
                  <button
                    className='primary-btn in-dark w-button lg:w-1/3'
                    style={{ textAlign: 'center' }}
                  >
                    <Link href={'/briefs'}>
                      Discover Briefs to Apply
                    </Link>
                  </button>
                </div>)
              : projects.map((project, index) => (
                <>
                  <Link
                    key={project.id}
                    // onClick={() => redirectToApplication(project)}
                    href={`/projects/${project.id}`}
                    rel="noopener noreferrer"
                  >
                    <div className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'>
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
                          {project.status_id && (
                            <button
                              className={`${applicationStatusId[project.status_id]
                                }-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[10px]`}
                            >
                              {applicationStatusId[project.status_id]}
                            </button>
                          )}
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
                  </Link>
                  {index !== projects.length - 1 && <Divider />}
                </>
              ))
        }
      </div>
    </div>
  );
}
