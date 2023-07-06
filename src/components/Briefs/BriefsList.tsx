import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React from 'react';
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export const BriefLists = ({
  briefs = [],
  showNewBriefButton,
  areAcceptedBriefs,
}: {
  briefs: any[];
  showNewBriefButton?: boolean;
  areAcceptedBriefs?: boolean;
}) => {
  const router = useRouter();

  const redirectToNewBrief = () => {
    router.push('/briefs/new');
  };

  const handleItemClick = (brief: any) => {
    if (brief.number_of_applications && !brief.project_id) {
      router.query.briefId = brief.id;
      router.push(router, undefined, { shallow: true });
    }

    areAcceptedBriefs && router.push(`/projects/${brief?.project_id}`);
  };

  if (briefs?.length === 0 && showNewBriefButton)
    return (
      <div className='flex justify-center w-full'>
        <button
          onClick={() => {
            redirectToNewBrief();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          Post a Brief
        </button>
      </div>
    );

  if (briefs?.length === 0 && !showNewBriefButton)
    return <h2 className='text-[16px] text-imbue-purple'>Nothing to show</h2>;

  return (
    <div className='bg-white mb-8 overflow-hidden rounded-xl'>
      {briefs?.map((brief, index) => (
        <div
          key={index}
          onClick={() => handleItemClick(brief)}
          className={`flex cursor-pointer hover:bg-imbue-light-purple-hover px-5 py-3 lg:px-10 lg:py-8 justify-between border-b border-b-imbue-light-purple last:border-b-0`}
        >
          <div className='flex flex-col gap-1 lg:gap-3'>
            <span className='text-sm text-imbue-purple-dark lg:text-xl'>{brief.headline}</span>
            <p className='text-xs lg:text-[16px] text-imbue-purple'>
              Budget ${Number(brief.budget).toLocaleString()} - Public
            </p>
            <p className='text-xs mt-3 text-imbue-purple'>
              Created {timeAgo.format(new Date(brief.created))}
            </p>
          </div>
          {brief.project_id ? (
            <div className='flex flex-col items-center w-1/3'>
              <p className='text-sm lg:text-xl text-imbue-purple-dark'>
                Milestones{' '}
                <span className='primary-text'>
                  {brief.milestones?.filter((m: any) => m?.is_approved)?.length}
                  /{brief.milestones?.length}
                </span>
              </p>
              <div className='w-full bg-light-grey h-1 relative my-auto'>
                <div
                  style={{
                    width: `${
                      (brief.milestones?.filter((m: any) => m?.is_approved)
                        ?.length /
                        brief.milestones?.length) *
                      100
                    }%`,
                  }}
                  className='h-full rounded-xl Accepted-button absolute'
                ></div>
                <div className='flex justify-evenly'>
                  {brief.milestones?.map((m: any, i: number) => (
                    <div
                      key={i}
                      className={`h-3 w-3 lg:h-4 lg:w-4 rounded-full -mt-1 lg:-mt-1.5 ${
                        m.is_approved ? 'bg-primary' : 'bg-light-grey'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 lg:gap-3'>
              <h2 className='text-sm lg:text-lg text-imbue-purple-dark'>Proposals</h2>
              <h2 className='text-sm lg:text-xl font-bold text-primary'>
                {brief.number_of_applications}
              </h2>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
