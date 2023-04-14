import React from "react";
import { FaRegShareSquare } from "react-icons/fa";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import Image from "next/image";
import { Brief, User } from "@/model";
import ChatPopup from "@/components/ChatPopup";

type BioInsightsProps = {
  redirectToApply: () => void;
  brief: Brief;
  isOwnerOfBrief: boolean | null;
  handleMessageBoxClick: () => void;
  showMessageBox: boolean;
  setShowMessageBox: (val: boolean) => void;
  targetUser: User | null;
  browsingUser: User | null;
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
}: BioInsightsProps) => {
  return (
    <div className="brief-insights px-10 py-5">
      <div className="subsection">
        <div className="header">
          <h3>Activities on this job</h3>
          <div className="flex gap-3 items-center mt-4">
            <button
              className="primary-btn in-dark w-[auto] flex items-center gap-2"
              onClick={() => redirectToApply()}
            >
              Submit a Proposal <FaRegShareSquare />
            </button>
            <button className="primary-btn primary-btn-outlined">Save</button>
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <div className="flex items-center">
            Applications:
            <span className="bg-indigo-700 ml-2 h-5 w-5 py-1 px-1.5 cursor-pointer text-xs rounded-full">
              ?
            </span>{" "}
            <span className="primary-text font-bold ml-2">Less than 5</span>
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <div className="flex items-center">
            Last viewed by freelancers:
            <span className="primary-text font-bold ml-2">3 hrs ago</span>
          </div>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <div>
            Currently Interviewing:
            <span className="primary-text font-bold ml-2">2</span>
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

      <h3>About Client</h3>

      <div className="subsection pb-2">
        <div className="brief-insights-stat flex gap-2 justify-start">
          <VerifiedIcon className="secondary-icon" />
          <span className="font-bold">Payment method verified</span>
          <div>
            {[4, 4, 4, 4].map((star, index) => (
              <StarIcon
                key={`${index}-star-icon`}
                className={`${index <= 4 && "primary-icon"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="subsection pb-2">
        <div className="brief-insights-stat flex flex-col">
          <div className="flex items-center">
            <MarkEmailUnreadOutlinedIcon />
            <h3 className="ml-3">
              <span className="mr-2">{brief.number_of_briefs_submitted}</span>
              Projects Posted
            </h3>
          </div>
          <p className="mt-2 text-gray-200">1 hire rate, one open job </p>
        </div>
      </div>

      <div className="subsection pb-2">
        <div className="brief-insights-stat flex flex-col">
          <div className="flex items-center">
            <Image
              className="h-4 w-6 object-cover"
              height={16}
              width={24}
              src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
              alt="Flag"
            />
            <h3 className="ml-3">United States</h3>
          </div>
          <p className="mt-2 text-gray-200">Member since Feb 19, 2023</p>
        </div>
      </div>

      {!isOwnerOfBrief && (
        <div className="mt-auto">
          <hr className="separator" />
          <div className="flex flex-col gap-4 mt-5">
            <div className="w-full flex gap-3 items-center justify-between">
              <span className="text-xl">Meet the hiring team</span>
              <button
                onClick={() => handleMessageBoxClick()}
                className="primary-btn in-dark w-button"
                style={{ marginTop: 0 }}
              >
                Message
              </button>
            </div>
            <h3>Job Link</h3>
            <div className="w-full h-12 p-3 bg-[#1A1A18] my-2 rounded-md">
              <span>http://www.imbue.com</span>
            </div>
            <span className="primary-text font-bold cursor-pointer">
              Copy Link
            </span>
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
      )}
    </div>
  );
};

export default BioInsights;
