import { useRouter } from "next/router";
import React from "react";
import { Freelancer, Project, OffchainProjectState, User } from "@/model";
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
      <button
        onClick={() => {
          redirectToDiscoverBriefs();
        }}
        className="primary-btn in-dark w-button w-1/3"
        style={{ textAlign: "center" }}
      >
        Discover Briefs
      </button>
    );

  return (
    <div className="bg-[#2c2c2c] border border-solid border-[#ffffff40] relative rounded-[0.75rem] overflow-hidden">
      {myApplications.map((application: Project, index: number) => (
        <div
          key={index}
          onClick={() => redirectToApplication(application)}
          className="hover:bg-secondary-dark-hover h-56 border-b border-b-light-white last:border-b-0 flex px-[2.5rem] py-[2rem] cursor-pointer gap-[2rem]"
        >
          <div className="w-4/5">
            <h3 className="text-xl font-bold mb-3">{application?.name}</h3>
          </div>
          <div className="flex flex-col justify-evenly items-center ml-auto">
            <span>{timeAgo?.format(new Date(application?.created))}</span>
            <div
              className={`px-4 py-2 ${
                OffchainProjectState[application.status_id]
              }-button w-fit rounded-full`}
            >
              {OffchainProjectState[application.status_id]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyFreelancerApplications;
