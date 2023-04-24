import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ApplicationContainer } from "../Briefs/ApplicationContainer";
import { Brief, Freelancer } from "@/model";
import { BriefLists } from "../Briefs/BriefsList";

type ClientViewProps = {
  briefId: number | undefined;
  setBriefId: Function;
  briefApplications: any;
  handleMessageBoxClick: (userId: number, freelander: Freelancer) => void;
  redirectToBriefApplications: (applicationId: string) => void;
  briefs: any;
};

const MyClientBriefsView = ({
  briefs,
  briefId,
  setBriefId,
  briefApplications,
  handleMessageBoxClick,
  redirectToBriefApplications,
}: ClientViewProps) => {
  return (
    <div>
      {briefId ? (
        <div className="bg-[#2c2c2c] border border-solid border-[#ffffff40] relative rounded-[0.75rem] ">
          <div
            className="absolute top-2 left-2 cursor-pointer"
            onClick={() => setBriefId(undefined)}
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
            setBriefId={setBriefId}
            showNewBriefButton={true}
          />
          <h2 className="text-base lg:text-xl font-bold mb-3 mt-4 lg:mt-10">Projects</h2>
          <BriefLists
            briefs={briefs?.acceptedBriefs}
            areAcceptedBriefs={true}
            setBriefId={setBriefId}
          />
        </div>
      )}
    </div>
  );
};

export default MyClientBriefsView;
