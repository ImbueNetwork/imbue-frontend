import { useRouter } from "next/router";
import React from "react";
import { Freelancer, Project, OffchainProjectState, User, displayState } from "@/model";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addLocale(en);

type FreelancerApplicationsType = {
  myApplications: any;
};

const timeAgo = new TimeAgo("en-US");

const MyFreelancerApplications = ({
  myApplications,
}: FreelancerApplicationsType): JSX.Element => {
  const router = useRouter();
  const redirectToApplication = (application: Project) => {

    let test = OffchainProjectState[application.status_id];
    //TODO: redirect to projects page if accepted
    // if (application.status_id === ProjectStatus?.Accepted) {
    //   router.push(`/project/${application?.id}`);
    // } else {
    router.push(
      `/briefs/${application.brief_id}/applications/${application.id}/`
    );
    // }
  };

  const redirectToDiscoverBriefs = () => {
    router.push(`/briefs`);
  };

  if (myApplications?.length === 0)
    return (
      <div className="w-full flex justify-center mt-6">
        <button
          onClick={() => {
            redirectToDiscoverBriefs();
          }}
          className="primary-btn in-dark w-button lg:w-1/3"
          style={{ textAlign: "center" }}
        >
          Discover Briefs
        </button>
      </div>
    );

  return (
    <div className="bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden">
      {myApplications?.map((application: Project, index: number) => (
        <div
          key={index}
          onClick={() => redirectToApplication(application)}
          className="hover:bg-secondary-dark-hover min-h-[100px] border-b border-b-light-white last:border-b-0 flex px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] cursor-pointer gap-[2rem]"
        >
          <div className="w-4/5 flex items-center">
            <h3 className="text-sm lg:text-xl font-bold mb-3">{application?.name}</h3>
          </div>
          <div className="flex flex-col gap-2 justify-evenly items-center ml-auto">
            <span className="text-xs lg:text-base">{timeAgo?.format(new Date(application?.created))}</span>
            <div
              className={`px-4 py-2 w-fit rounded-full text-xs lg:text-base ${OffchainProjectState[application.status_id]
                }-button `}
            >

              {displayState(application.status_id)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyFreelancerApplications;
