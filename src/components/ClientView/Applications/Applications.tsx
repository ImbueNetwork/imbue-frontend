import { useContext } from 'react';
import useSWR from 'swr'

import BackButton from '@/components/BackButton';
import { ApplicationContainer } from '@/components/Briefs/ApplicationContainer';
import ApplicationSkeleton from '@/components/Briefs/ApplicationSkeleton';
import { BriefLists } from '@/components/Briefs/BriefsList';
import { AppContext, AppContextType } from '@/components/Layout';

import { Freelancer } from '@/model';
import { getBriefApplications } from '@/redux/services/briefService';

interface ClientViewProps {
  goBack: () => void;
  briefId: string | string[] | undefined;
  briefs: any;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  // redirectToBriefApplications: (_applicationId: string) => void;
  // briefApplications: Project[];
  // loadingApplications: boolean;
}

export default function Applications({
  briefId,
  briefs,
  handleMessageBoxClick,
  // redirectToBriefApplications,
  // briefApplications,
  // loadingApplications,
  goBack,
}: ClientViewProps) {
  // const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  // const [loadingApplications, setLoadingApplications] = useState<boolean>(true);

  // const { user, loading } = useSelector((state: RootState) => state.userState);

  // useEffect(() => {
  //   const getApplications = async () => {
  //     if (!briefId || !user.id) return

  //     try {
  //       setLoadingApplications(true);
  //       const resp = await getBriefApplications(String(briefId));

  //       if (resp.status === 501)
  //         return router.push('/dashboard');

  //       setBriefApplications(resp);
  //       setLoadingApplications(false);
  //     } catch (error) {
  //       console.log(error);
  //       setLoadingApplications(false);
  //     }
  //   };

  //   briefId && getApplications();
  // }, [briefId, loading, router, user.id]);

  const { setError } = useContext(AppContext) as AppContextType;

  const {
    data: briefApplications,
    isLoading: loadingApplications,
    error
  } = useSWR(() => briefId ? `/api/briefs/${briefId}/applications` : null, () => getBriefApplications(String(briefId)))

  if (error) {
    setError(error);
  }

  return (
    <div className='bg-white relative rounded-[0.75rem] '>
      {briefId ? (
        <div className='bg-white relative rounded-[0.75rem] '>
          <div
            className='absolute top-5 left-3 cursor-pointer'
            onClick={goBack}
          >
            <BackButton />
          </div>
          {loadingApplications
            ? <ApplicationSkeleton />
            : (
              <>
                {briefApplications?.map((application: any, index: any) => {
                  return (
                    <ApplicationContainer
                      key={index}
                      application={application}
                      handleMessageBoxClick={handleMessageBoxClick}
                    // redirectToApplication={redirectToBriefApplications}
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
