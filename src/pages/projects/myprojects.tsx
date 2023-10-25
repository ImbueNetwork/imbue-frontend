import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BreifApplication from '@/components/Dashboard/FreelacerView/BriefApplication/BreifApplication';
import OngoingProject from '@/components/Dashboard/FreelacerView/OngoingProject/OngoingProject';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export default function Myprojects() {
  const [switcher, setSwitcher] = useState('completed');
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
      <div className=' mx-2 border   justify-between rounded-3xl flex'>
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
          className='text-2xl text-black py-5 text-center border-r w-full'
        >
          Pending Projects
        </p>
        <p
          onClick={() => setSwitcher('saved')}
          className='text-2xl text-black border-r py-5 text-center w-full'
        >
          Saved Projects
        </p>
      </div>
      <div className='mt-5'>
        {switcher === 'completed' && <OngoingProject projects={projects} />}
        {switcher === 'Active' && <OngoingProject projects={projects} />}
        {switcher === 'pending' && <BreifApplication applications={projects} />}
        {switcher === 'saved' && <OngoingProject projects={projects} />}
      </div>
    </div>
  );
}
