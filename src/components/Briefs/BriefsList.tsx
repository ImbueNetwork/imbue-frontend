import React from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useRouter } from "next/router";
TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo("en-US");

export const BriefLists = ({
  briefs = [],
  setBriefId,
  showNewBriefButton,
  areAcceptedBriefs,
}: {
  briefs: any[];
  setBriefId: Function;
  showNewBriefButton?: boolean;
  areAcceptedBriefs?: boolean;
}) => {
  const router = useRouter();

  const redirectToNewBrief = () => {
    router.push("/briefs/new");
  };

  if (briefs?.length === 0 && showNewBriefButton)
    return (
      <div className="flex justify-center w-full">
      <button
        onClick={() => {
          redirectToNewBrief();
        }}
        className="primary-btn in-dark w-button lg:w-1/3"
        style={{ textAlign: "center" }}
      >
        Post a Brief
      </button>
      </div>
    );

  if (briefs?.length === 0 && !showNewBriefButton)
    return <h2 className="text-[16px]">Nothing to show</h2>;

  return (
    <div className="bg-[#2c2c2c] mb-8 border border-light-white overflow-hidden rounded-[0.75rem]">
      {briefs?.map((brief, index) => (
        <div
          key={index}
          onClick={() => {
            brief.number_of_applications &&
              !brief.project_id &&
              setBriefId(brief.id);

            areAcceptedBriefs && router.push(`/projects/${brief?.project_id}`);
          }}
          className={`flex cursor-pointer hover:bg-secondary-dark-hover px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] justify-between border-b border-b-light-white last:border-b-0`}
        >
          <div className="flex flex-col gap-1 lg:gap-3">
            <h3 className="text-sm lg:text-xl font-bold">{brief.headline}</h3>
            <p className="text-xs lg:text-[16px]">
              Budget ${Number(brief.budget).toLocaleString()} - Public
<<<<<<< HEAD

=======
>>>>>>> origin/main
            </p>
            <p className="text-xs lg:text-[16px]">
              Created {timeAgo.format(new Date(brief.created))}
            </p>
          </div>
          {brief.project_id ? (
            <div className="flex flex-col items-center w-1/3">
              <h3 className="text-sm lg:text-xl">
                Milestones{" "}
                <span className="primary-text">
                  {brief.milestones?.filter((m: any) => m?.is_approved)?.length}
                  /{brief.milestones?.length}
                </span>
              </h3>
              <div className="w-full bg-[#1C2608] h-1 relative my-auto">
                <div
                  style={{
                    width: `${
                      (brief.milestones?.filter((m: any) => m?.is_approved)
                        ?.length /
                        brief.milestones?.length) *
                      100
                    }%`,
                  }}
                  className="h-full rounded-xl Accepted-button absolute"
                ></div>
                <div className="flex justify-evenly">
                  {brief.milestones?.map((m: any, i: number) => (
                    <div
                      key={i}
                      className={`h-3 w-3 lg:h-4 lg:w-4 rounded-full -mt-1 lg:-mt-1.5 ${
                        m.is_approved ? "Accepted-button" : "bg-[#1C2608]"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 lg:gap-3">
              <h2 className="text-sm lg:ext-xl font-bold">Proposals</h2>
              <h2 className="text-sm lg:text-xl font-bold text-primary">
                {brief.number_of_applications}
              </h2>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
