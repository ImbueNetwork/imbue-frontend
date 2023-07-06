import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import Image from 'next/image';
import React from 'react';
import { FaRegShareSquare } from 'react-icons/fa';

import ChatPopup from '@/components/ChatPopup';

import { copyIcon } from '@/assets/svgs';
import { Brief, User } from '@/model';

type BioInsightsProps = {
  redirectToApply: () => void;
  brief: Brief;
  isOwnerOfBrief: boolean | null;
  handleMessageBoxClick: () => void;
  saveBrief?: () => void;
  showMessageBox: boolean;
  setShowMessageBox: (_: boolean) => void;
  targetUser: User | null;
  browsingUser: User | null;
  canSubmitProposal: boolean;
  isSavedBrief?: boolean;
};

const BioInsights = ({
  redirectToApply,
  brief,
  browsingUser,
  isOwnerOfBrief,
  handleMessageBoxClick,
  showMessageBox,
  setShowMessageBox,
  targetUser,
  canSubmitProposal,
  saveBrief,
  isSavedBrief,
}: BioInsightsProps) => {
  return (
    <div
      className='brief-insights 
      xl:py-[3rem]
      xl:px-[3.88rem]
      py-[1.5rem]
      px-[1.5rem]
      lg:py-[2rem]
      lg:px-[1.88rem]
      mt-[2rem]
      lg:mt-0
      w-full
      md:w-[35%]
    '
    >
      <div className='subsection max-width-750px:!my-0'>
        <div className='header'>
          <h3 className='text-imbue-purple-dark !font-normal'>
            Activities on this job
          </h3>
          <div className='flex gap-3 lg:items-center mt-4 md:flex-row flex-col'>
            <button
              disabled={isSavedBrief}
              onClick={() => saveBrief && saveBrief?.()}
              className={` bg-transparent border border-imbue-purple-dark rounded-[1.5rem] h-[2.48rem] text-imbue-purple-dark text-[1rem] font-normal px-[2.5rem] max-width-1100px:w-full max-width-500px:w-auto `}
            >
              Save
            </button>
            <button
              className='primary-btn 
              in-dark
              max-width-750px:!px-4 
              flex 
              items-center 
              gap-2
              !text-[1rem]
              !font-normal
              w-full
              md:w-auto
              min-h-[2.48rem]
              '
              onClick={() => redirectToApply()}
              disabled={!canSubmitProposal}
            >
              Submit a Proposal <FaRegShareSquare />
            </button>
          </div>
        </div>
      </div>

      <div className='subsection !mb-[0.75rem]'>
        <div className='brief-insights-stat'>
          <div className='flex items-center text-imbue-purple-dark '>
            Applications:
            <span className='bg-indigo-700 ml-2 h-5 w-5 py-1 px-1.5 cursor-pointer text-xs !text-white rounded-full flex justify-center items-center'>
              ?
            </span>{' '}
            <span className='primary-text font-normal ml-2 !text-imbue-lemon'>
              Less than 5
            </span>
          </div>
        </div>
      </div>

      <div className='subsection !mt-0 !mb-[0.75rem]'>
        <div className='brief-insights-stat'>
          <div className='flex items-center text-imbue-purple-dark'>
            Last viewed by freelancers:
            <span className='primary-text font-bold ml-2 !text-imbue-lemon'>
              3 hrs ago
            </span>
          </div>
        </div>
      </div>

      <div className='subsection !mt-0'>
        <div className='brief-insights-stat'>
          <div className='text-imbue-purple-dark'>
            Currently Interviewing:
            <span className='primary-text font-bold ml-2 !text-imbue-lemon'>
              2
            </span>
          </div>
        </div>
      </div>

      {/* Fixme: not implemented in figma design */}
      {/* <div className="subsection">
                <div className="brief-insights-stat">
                    <IoMdWallet className="brief-insight-icon" />
                    <h3>
                        Total Spent <span className="primary-text">$250,000</span>
                    </h3>
                </div>
            </div> */}

      <h3 className='mt-[3rem] text-imbue-purple-dark !font-normal'>
        About Client
      </h3>

      <div className=' bg-imbue-light-purple-three p-[1rem] rounded-[0.5rem] mt-3'>
        <div className='subsection pb-2 !mt-0 !mb-[1.2rem] '>
          <div className='brief-insights-stat flex gap-2 justify-start items-center max-width-1800px:flex-wrap '>
            <VerifiedIcon className='secondary-icon' sx={{ height: '1rem' }} />
            <span className='font-normal text-imbue-purple-dark text-[1rem] mr-3'>
              Payment method verified
            </span>
            <div>
              {[4, 4, 4, 4].map((star, index) => (
                <StarIcon
                  key={`${index}-star-icon`}
                  className={`${index <= 4 && 'primary-icon'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='subsection pb-2 !mt-[0px]'>
          <div className='brief-insights-stat flex flex-col'>
            <div className='flex items-center text-imbue-purple-dark !font-normal'>
              <MarkEmailUnreadOutlinedIcon sx={{ height: '1rem' }} />
              <h3 className='ml-1 !font-normal'>
                <span className='mr-2 '>
                  {brief.number_of_briefs_submitted}
                </span>
                Projects Posted
              </h3>
            </div>
            <p className='mt-2 text-imbue-purple text-[1rem]'>
              1 hire rate, one open job{' '}
            </p>
          </div>
        </div>

        <div className='subsection pb-0 !my-0'>
          <div className='brief-insights-stat flex flex-col'>
            <div className='flex items-center'>
              <Image
                className='h-4 w-6 object-cover'
                height={16}
                width={24}
                src='https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'
                alt='Flag'
              />
              <h3 className='ml-2 text-imbue-purple-dark !font-normal'>
                United States
              </h3>
            </div>
            <p className='mt-2 text-imbue-purple text-[1rem]'>
              Member since Feb 19, 2023
            </p>
          </div>
        </div>
      </div>

      <div className='mt-auto'>
        <hr className='separator' />
        <div className='flex flex-col gap-4 mt-5'>
          {!isOwnerOfBrief && (
            <div className='w-full flex gap-3 items-center justify-between'>
              <span className='text-xl text-imbue-purple-dark !font-normal'>
                Meet the hiring team
              </span>
              <button
                onClick={() => handleMessageBoxClick()}
                className='primary-btn in-dark w-button'
                style={{ marginTop: 0 }}
              >
                Message
              </button>
            </div>
          )}
          <h3 className='text-imbue-purple-dark !font-normal'>Job Link</h3>
          <div className='flex justify-between items-center'>
            <div className='h-[2.625rem] rounded-[6.18rem] flex items-center px-[2rem] bg-imbue-light-purple my-2'>
              <span className='text-imbue-purple text-[1rem]'>
                http://www.imbue.com
              </span>
            </div>

            <Image src={copyIcon} alt='copyIcon' className='cursor-pointer' />
          </div>
        </div>
        {browsingUser && showMessageBox && (
          <ChatPopup
            showMessageBox={showMessageBox}
            setShowMessageBox={setShowMessageBox}
            targetUser={targetUser}
            browsingUser={browsingUser}
          />
        )}
      </div>
    </div>
  );
};

export default BioInsights;
