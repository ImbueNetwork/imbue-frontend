import { Divider } from '@mui/material';
import cn from 'classnames';
import { useMemo, useState } from 'react';

import { displayState,Project } from '@/model';

import BreifApplication from './BriefApplication/BreifApplication';
import OngoingProject from './OngoingProject/OngoingProject';

interface FreelacerViewProps {
  myApplications: any;
  currentProject: Project[];
}

const FreelancerView: React.FC<FreelacerViewProps> = ({
  myApplications,
  currentProject,
}) => {
  const [switcher, setSwitcher] = useState('application');
  const acceptedApplication = useMemo(() => {
    let num = 0;
    myApplications.filter((item: any) => {
      num += displayState(item?.status_id || 0) === 'Accepted' ? 1 : 0;
    });
    return num;
  }, [myApplications]);

  return (
    <div className='bg-white rounded-2xl overflow-hidden'>
      <div className='text-imbue-purple py-7  px-9 flex   text-sm space-x-9'>
        <p
          className={cn(
            'cursor-pointer text-xs sm:text-lg',
            switcher === 'application'
              ? 'text-imbue-purple'
              : 'text-imbue-light-purple-two'
          )}
          onClick={() => setSwitcher('application')}
        >
          Brief Applications{' '}
          <span className='text-sm'>
            ({acceptedApplication + '/' + myApplications.length})
          </span>
        </p>
        <p
          className={cn(
            'cursor-pointer text-xs  sm:text-lg ',
            switcher === 'ongoingproject'
              ? 'text-imbue-purple'
              : 'text-imbue-light-purple-two'
          )}
          onClick={() => setSwitcher('ongoingproject')}
        >
          Ongoing projects
          <span className='text-sm ml-2'>({currentProject.length})</span>
        </p>
      </div>
      <Divider />
      {switcher === 'application' && (
        <BreifApplication applications={myApplications} />
      )}
      {switcher === 'ongoingproject' && (
        <OngoingProject projects={currentProject} />
      )}
    </div>
  );
};

export default FreelancerView;
