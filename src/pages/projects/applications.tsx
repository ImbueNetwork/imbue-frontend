import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BreifApplication from '@/components/Dashboard/FreelacerView/BriefApplication/BreifApplication';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export default function Applications() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const getProjects = async () => {
    const Briefs = await getFreelancerApplications(user.id);

    const projectRes = Briefs.filter((item) => !item.chain_project_id);
    setProjects(projectRes);
  };

  useEffect(() => {
    if (user?.id) getProjects();
  }, [user.id]);

  if (loadingUser) {
    return <FullScreenLoader />;
  }
  return (
    <div className='bg-white rounded-3xl pt-5'>
      <div className=' mx-2 border px-7 py-5 rounded-3xl'>
        <p className='text-2xl text-black'>ongoing projects</p>
      </div>
      <div className=''>
        <BreifApplication applications={projects} />
      </div>
    </div>
  );
}
