import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/router';
import { Suspense, useState } from 'react';

import { Freelancer, Project } from '@/model';

import Applications from './Applications/Applications';
// const Applications = lazy(() => import('./Applications/Applications'))
import Grants from './Grants/Grants';
import Projects from './Projects/Projects';
import ApplicationSkeleton from '../Briefs/ApplicationSkeleton';

interface ClientViewProps {
  GoBack: () => void;
  briefId: string | string[] | undefined;
  briefs: any;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  ongoingGrants: Project[];
  // redirectToBriefApplications: (_applicationId: string) => void;
  // briefApplications: Project[];
  // loadingApplications: boolean;
}

export default function ClientView({
  GoBack,
  briefId,
  briefs,
  handleMessageBoxClick,
  ongoingGrants,
  // redirectToBriefApplications,
  // briefApplications,
  // loadingApplications,
}: ClientViewProps) {
  const [switcher, setSwitcher] = useState('application');
  const router = useRouter();
  return (
    <div className='bg-white rounded-2xl overflow-hidden'>
      <div className='flex items-center w-full'>
        <div
          onClick={() => router.back()}
          className='border border-content ml-2 group hover:bg-content rounded-full flex items-center justify-center cursor-pointer  left-5 top-10'
        >
          <ArrowBackIcon
            className='h-7 w-7 group-hover:text-white'
            color='secondary'
          />
        </div>
        <div className='mx-2 border w-full justify-between rounded-3xl flex cursor-pointer'>
          <p
            onClick={() => setSwitcher('application')}
            className='text-base lg:text-2xl text-black py-3 lg:py-5 border-r text-center w-full  '
          >
            Briefs ({briefs?.briefsUnderReview?.length || 0})
          </p>
          <p
            onClick={() => setSwitcher('projects')}
            className='text-base lg:text-2xl text-black py-3 lg:py-5 border-r text-center w-full'
          >
            Projects({briefs?.acceptedBriefs?.length || 0})
          </p>
          <p
            onClick={() => setSwitcher('grants')}
            className='text-base lg:text-2xl text-black py-3 lg:py-5 text-center w-full'
          >
            Grants({ongoingGrants?.length || 0})
          </p>
        </div>
      </div>
      {/* <div className='text-imbue-purple py-7 px-9 flex text-sm space-x-9 border-b border-b-imbue-light-purple'>
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
      </div> */}
      {/* <Divider className='mb-5' /> */}

      {switcher === 'application' && (
        <Suspense fallback={<ApplicationSkeleton />}>
          <Applications
            briefId={briefId}
            goBack={GoBack}
            briefs={briefs}
            handleMessageBoxClick={handleMessageBoxClick}
          // briefApplications={briefApplications}
          // loadingApplications={loadingApplications}
          // redirectToBriefApplications={redirectToBriefApplications}
          />
        </Suspense>
      )}
      {switcher === 'projects' && <Projects briefs={briefs} />}
      {switcher === 'grants' && <Grants ongoingGrants={ongoingGrants} />}
    </div>
  );
}
