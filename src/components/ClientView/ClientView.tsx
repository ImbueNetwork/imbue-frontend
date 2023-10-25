import classNames from 'classnames';
import { useState } from 'react';

import { Freelancer, Project } from '@/model';

import Applications from './Applications/Applications';
import Grants from './Grants/Grants';
import Projects from './Projects/Projects';

interface ClientViewProps {
  GoBack: () => void;
  briefId: string | string[] | undefined;
  briefs: any;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  briefApplications: Project[];
  ongoingGrants: Project[];
  loadingApplications: boolean;
}

export default function ClientView({
  GoBack,
  briefId,
  briefs,
  handleMessageBoxClick,
  redirectToBriefApplications,
  briefApplications,
  ongoingGrants,
  loadingApplications,
}: ClientViewProps) {
  const [switcher, setSwitcher] = useState('application');
  return (
    <div className='bg-white rounded-2xl overflow-hidden'>
      <div className='text-imbue-purple py-7 px-9 flex text-sm space-x-9 border-b border-b-imbue-light-purple'>
        <p
          onClick={() => setSwitcher('application')}
          className={classNames(
            'cursor-pointer text-xs sm:text-lg',
            switcher === 'application'
              ? 'text-imbue-purple'
              : 'text-imbue-light-purple-two'
          )}
        >
          Briefs ({briefs?.briefsUnderReview?.length})
        </p>
        <p
          onClick={() => setSwitcher('projects')}
          className={classNames(
            'cursor-pointer text-xs sm:text-lg',
            switcher === 'projects'
              ? 'text-imbue-purple'
              : 'text-imbue-light-purple-two'
          )}
        >
          Projects({briefs?.acceptedBriefs.length})
        </p>
        <p
          onClick={() => setSwitcher('grants')}
          className={classNames(
            'cursor-pointer text-xs sm:text-lg',
            switcher === 'grants'
              ? 'text-imbue-purple'
              : 'text-imbue-light-purple-two'
          )}
        >
          Grants({ongoingGrants.length})
        </p>
      </div>
      {/* <Divider className='mb-5' /> */}

      {switcher === 'application' && (
        <Applications
          briefId={briefId}
          goBack={GoBack}
          briefs={briefs}
          briefApplications={briefApplications}
          loadingApplications={loadingApplications}
          handleMessageBoxClick={handleMessageBoxClick}
          redirectToBriefApplications={redirectToBriefApplications}
        />
      )}
      {switcher === 'projects' && <Projects briefs={briefs} />}
      {switcher === 'grants' && <Grants ongoingGrants={ongoingGrants} />}
    </div>
  );
}
