import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { ProgressBar } from '../ProgressBar';
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
  /// limit of open brief
  const openBriefLimit = 2;

  const [loadValue, setValue] = useState(openBriefLimit);

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
      <div className='flex justify-center w-full my-5'>
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
    <>
      <div className='bg-white mb-8 overflow-hidden'>
        {briefs?.map(
          (brief, index) =>
            index <
            Math.min(Math.max(loadValue, openBriefLimit), briefs.length) && (
              <div
                key={index}
                onClick={() => handleItemClick(brief)}
                className={`flex cursor-pointer group hover:bg-imbue-light-purple-hover px-5 py-3 lg:px-10 lg:py-8 justify-between border-b border-b-imbue-light-purple ${briefs.length < 2 && 'last:border-b-0'}`}
              >
                <div className='flex flex-col gap-2 lg:gap-3 w-2/3'>
                  <span className='text-sm text-imbue-purple-dark lg:text-xl'>
                    {brief?.headline?.length > 50
                      ? `${brief.headline.substring(0, 50)}...`
                      : brief.headline}
                  </span>
                  <p className='text-xs lg:text-[16px] text-imbue-purple'>
                    Budget ${Number(brief.budget).toLocaleString()}
                  </p>
                  <p className='text-xs lg:text-sm w-4/5 text-content break-all whitespace-pre-wrap'>
                    {brief?.description?.length > 500
                      ? brief?.description?.substring(0, 500) + '...'
                      : brief?.description}
                  </p>
                  <p className='text-xs mt-2 lg:mt-3 text-imbue-purple'>
                    Created {timeAgo.format(new Date(brief.created))}
                  </p>
                </div>
                {brief.project_id ? (
                  <div className='flex flex-col items-center w-1/4'>
                    <p className='text-sm lg:text-xl text-imbue-purple-dark flex flex-col items-center lg:flex-row gap-2'>
                      Milestones{' '}
                      <span className='text-imbue-lemon font-semibold'>
                        {
                          brief.milestones?.filter((m: any) => m?.is_approved)
                            ?.length
                        }
                        /{brief.milestones?.length}
                      </span>
                    </p>
                    {/* <div className='w-full group-hover:bg-white bg-light-grey h-1 relative my-auto'>
                      <div
                        style={{
                          width: `${
                            (brief.milestones?.filter(
                              (m: any) => m?.is_approved
                            )?.length /
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
                              m.is_approved
                                ? 'bg-primary'
                                : 'bg-light-grey group-hover:bg-white'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div> */}
                    <div className='w-full my-auto'>
                      <ProgressBar
                        titleArray={Array(brief.milestones?.length + 1).fill(
                          ''
                        )}
                        isPrimary={true}
                        currentValue={
                          brief.milestones?.filter(
                            (it: any) => it.is_approved === true
                          ).length
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2 lg:gap-3'>
                    <h2 className='text-sm lg:text-lg text-imbue-purple-dark'>
                      Proposals
                    </h2>
                    <h2 className='text-sm lg:text-xl text-imbue-lemon font-semibold'>
                      {brief.number_of_applications}
                    </h2>
                  </div>
                )}
              </div>
            )
        )}
      </div>
      <div className='flex'>
        {loadValue < briefs.length && (
          <div className='flex w-full justify-center items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value + openBriefLimit);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                load more
              </button>
            </div>
          </div>
        )}
        {loadValue > openBriefLimit && briefs.length > openBriefLimit && (
          <div className='flex w-full justify-center items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value - openBriefLimit);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                show less
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
