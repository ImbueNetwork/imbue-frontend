import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { displayState,OffchainProjectState, Project } from "@/model";
TimeAgo.addLocale(en);

type FreelancerApplicationsType = {
  myApplications: any;
};

const timeAgo = new TimeAgo('en-US');

const MyFreelancerApplications = ({
  myApplications,
}: FreelancerApplicationsType): JSX.Element => {
  const router = useRouter();
  const ongoingBriefs = myApplications?.filter((application: any) => !application?.chain_project_id)
  const cuttentBriefs = myApplications?.filter((application: any) => application?.chain_project_id)
  const [appliedBriefs] = useState<any>(ongoingBriefs)
  const [currentProject] = useState<any>(cuttentBriefs)

  const redirectToApplication = (application: Project) => {
    router.push(
      `/briefs/${application.brief_id}/applications/${application.id}/`
    );
  };

  const redirectToDiscoverBriefs = () => {
    router.push(`/briefs`);
  };

  if (myApplications?.length === 0)
    return (
      <div className='w-full flex justify-center mt-6'>
        <button
          onClick={() => {
            redirectToDiscoverBriefs();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          Discover Briefs
        </button>
      </div>
    );

  return (
    <>
      <h3 className="mb-3">Applied Briefs</h3>
      {
        appliedBriefs?.length
          ? (
            <div className="bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden">
              {myApplications?.map((application: Project, index: number) => !application?.chain_project_id
                && (
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
          )
          : <div className="w-full flex justify-center mt-6">
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
      }

      {
        currentProject?.length
          ? (<>
            <h3 className="mb-3 mt-10">Current Projects</h3>
            <div className="bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden">
              {myApplications?.map((application: Project, index: number) => application?.chain_project_id && (
                <div
                  key={index}
                  onClick={() => router.push(`/projects/${application?.id}`)}
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
          </>)
          : <></>
      }
    </>

  );
};

export default MyFreelancerApplications;
