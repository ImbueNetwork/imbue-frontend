import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ApplicationContainer } from "../Briefs/ApplicationContainer";
import { Brief, Freelancer } from "@/model";
import { BriefLists } from "../Briefs/BriefsList";
import { useRouter } from "next/router";

type ClientViewProps = {
  briefId: string | string[] | undefined;
  briefApplications: any;
  handleMessageBoxClick: (userId: number, freelander: Freelancer) => void;
  redirectToBriefApplications: (applicationId: string) => void;
  briefs: any;
};

const MyClientBriefsView = ({
  briefs,
  briefId,
  briefApplications,
  handleMessageBoxClick,
  redirectToBriefApplications,
}: ClientViewProps) => {
  const router = useRouter()

  const goBack = () =>{
    router.query.briefId = []
    router.replace(router, undefined, {shallow:true})
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

export default MyClientBriefsView;
