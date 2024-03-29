import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import OngoingProject from '@/components/Dashboard/FreelacerView/OngoingProject/OngoingProject';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export default function Ongoing() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const getProjects = async () => {
      const Briefs = await getFreelancerApplications(user.id);

      const projectRes = Briefs.filter((item) => item.chain_project_id);
      setProjects(projectRes);
    };

    if (user?.id) getProjects();
  }, [user.id]);

  if (loadingUser) {
    return <FullScreenLoader />;
  }
  return (
    <div className='bg-white rounded-3xl overflow-hidden pt-5'>
      <div className=' mx-2 border px-7 py-5 rounded-3xl'>
        <p className='text-2xl text-black'>Ongoing Projects</p>
      </div>
      <div className=''>
        <OngoingProject projects={projects} />
      </div>
    </div>
  );
}
