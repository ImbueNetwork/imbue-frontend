import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BreifApplication from '@/components/Dashboard/FreelacerView/BriefApplication/BreifApplication';
import FullScreenLoader from '@/components/FullScreenLoader';

import { applicationStatusId, Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export default function Applications() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter()
  const { status_id } = router.query

  useEffect(() => {
    const getProjects = async () => {
      setLoading(true)

      try {
        const Briefs = await getFreelancerApplications(user.id);

        const projectRes = Briefs.filter((item) => item.status_id == status_id && !item.chain_project_id);
        setProjects(projectRes);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      } finally {
        setLoading(false)
      }
    };

    if (user?.id) getProjects();
  }, [status_id, user.id]);

  if (loadingUser || loading) {
    return <FullScreenLoader />;
  }
  return (
    <div className='bg-white rounded-3xl pt-5 overflow-hidden relative'>
      <div
        onClick={() => router.back()}
        className='border border-content group hover:bg-content rounded-full flex items-center justify-center cursor-pointer absolute left-5 top-10'
      >
        <ArrowBackIcon className='h-7 w-7 group-hover:text-white' color='secondary' />
      </div>
      <div className=' mx-2 border px-7 py-5 rounded-3xl'>
        <p className='text-2xl text-black ml-10'>{applicationStatusId[Number(status_id)]} Projects</p>
      </div>
      <div className='mt-5'>
        <BreifApplication applications={projects} />
      </div>
    </div>
  );
}
