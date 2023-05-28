import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ApplicationContainer } from "../Briefs/ApplicationContainer";
import { Brief, Freelancer, Project } from "@/model";
import { BriefLists } from "../Briefs/BriefsList";
import { useRouter } from "next/router";
import { getBriefApplications } from "@/redux/services/briefService";
import FullScreenLoader from "../FullScreenLoader";
import { Skeleton } from "@mui/material";

type ClientViewProps = {
  briefId: string | string[] | undefined;
  handleMessageBoxClick: (userId: number, freelander: Freelancer) => void;
  redirectToBriefApplications: (applicationId: string) => void;
  briefs: any;
};

const MyClientBriefsView = (props: ClientViewProps) => {

  const {
    briefs,
    briefId,
    handleMessageBoxClick,
    redirectToBriefApplications,
  } = props

  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const router = useRouter()

  useEffect(() => {
    const getApplications = async (id: string | number) => {
      setBriefApplications(await getBriefApplications(id));
    };
    briefId && getApplications(briefId.toString());
    setLoadingApplications(false)
  }, [briefId]);


  const goBack = () => {
    router.query.briefId = []
    router.replace(router, undefined, { shallow: true })
  }

  return (
    <div>
      {briefId ? (
        <div className="bg-theme-grey-dark border border-solid border-light-white relative rounded-[0.75rem] ">
          <div
            className="absolute top-2 left-2 cursor-pointer"
            onClick={goBack}
          >
            <ArrowBackIcon />
          </div>
          {
            loadingApplications
              ? <ApplicationSkeleton />
              : <>
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
          }

        </div>
      ) : (
        <div>
          <h2 className="text-base lg:text-xl font-bold mb-3">Open Briefs</h2>
          <BriefLists
            briefs={briefs?.briefsUnderReview}
            showNewBriefButton={true}
          />

          <h2 className="text-base lg:text-xl font-bold mb-3 mt-4 lg:mt-10">Projects</h2>
          <BriefLists
            briefs={briefs?.acceptedBriefs}
            areAcceptedBriefs={true}
          />

        </div>
      )}
    </div>
  );
};

export function ApplicationSkeleton() {
  return (
    <div className="bg-theme-grey-dark border border-light-white overflow-hidden rounded-xl">
      {
        [1, 2].map((v, i) => (
          <div key={i} className="w-full px-5 py-3 lg:px-10 lg:py-8 border-b last:border-b-0 border-b-light-white">
            <div className="flex justify-between">
              <Skeleton className="w-1/6" animation="wave" variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton className="w-1/6" animation="wave" variant="text" sx={{ fontSize: '1rem' }} />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-1/2" animation="wave" variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton className="w-1/12" animation="wave" variant="text" sx={{ fontSize: '1rem' }} />
            </div>
            <Skeleton className="w-1/12" animation="wave" variant="text" sx={{ fontSize: '1rem' }} />
          </div>
        ))
      }

    </div>
  )
}

export default MyClientBriefsView;
