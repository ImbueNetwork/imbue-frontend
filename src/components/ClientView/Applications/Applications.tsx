import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ApplicationContainer } from '@/components/Briefs/ApplicationContainer';
import ApplicationSkeleton from '@/components/Briefs/ApplicationSkeleton';
import { BriefLists } from '@/components/Briefs/BriefsList';

import { Freelancer, Project } from '@/model';

interface ClientViewProps {
  goBack: () => void;
  briefId: string | string[] | undefined;
  briefs: any;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  briefApplications: Project[];
  loadingApplications: boolean;
}

export default function Applications({
  briefId,
  briefs,
  handleMessageBoxClick,
  redirectToBriefApplications,
  briefApplications,
  loadingApplications,
  goBack,
}: ClientViewProps) {
  return (
    <div className='bg-white relative rounded-[0.75rem] '>
      {briefId ? (
        <div className='bg-white relative rounded-[0.75rem] '>
          <div
            className='absolute top-2 left-2 cursor-pointer'
            onClick={goBack}
          >
            <ArrowBackIcon htmlColor='#3B27C1' />
          </div>
          {loadingApplications ? (
            <ApplicationSkeleton />
          ) : (
            <>
              {briefApplications?.map((application: any, index: any) => {
                return (
                  <ApplicationContainer
                    application={application}
                    handleMessageBoxClick={handleMessageBoxClick}
                    redirectToApplication={redirectToBriefApplications}
                    key={index}
                  />
                );
              })}
            </>
          )}
        </div>
      ) : (
        <div>
          <BriefLists
            briefs={briefs?.briefsUnderReview}
            showNewBriefButton={true}
          />
        </div>
      )}
    </div>
  );
}
