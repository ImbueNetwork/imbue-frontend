/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FaPaperclip } from "react-icons/fa";
import { ApplicationContainerProps, Brief, User } from "@/model";
import Image from "next/image";

interface BriefApplicationsProps {
  brief: Brief;
  browsingUser: User;
}

export const ApplicationContainer = ({
  application,
  redirectToApplication,
  handleMessageBoxClick,
}: ApplicationContainerProps) => {
  return (
    <div className="flex flex-row px-[60px] py-[35px] gap-[50px] border-b-[none]">
      <Image
        src={require("@/assets/images/profile-image.png")}
        className="h-[45px] w-[45px] object-cover"
        alt={"profile-picture"}
        height={45}
        width={45}
      />
      <div className="flex flex-col gap-[10px] grow">
        <div className="flex flex-row items-center">
          <div className="user-id text-primary">
            @{application?.freelancer?.username}
          </div>
          {/* <div className="country">
                        <div className="country-flag">
                            <ReactCountryFlag countryCode="us" />
                        </div>
                        <div className="country-name text-grey">
                            United States
                        </div>
                    </div> */}

          <div className="ctas-container ml-auto">
            {/* TODO: Like/unlike feature. On hold */}
            {/* <div className="cta-votes">
                                            <div className="cta-vote">
                                                <FaRegThumbsUp />
                                                Yes
                                            </div>
                                            <div className="cta-vote">
                                                <FaRegThumbsDown />
                                                No
                                            </div>
                                        </div> */}
            <button
              className="primary-btn in-dark w-button"
              onClick={() => redirectToApplication(application?.id)}
            >
              View proposal
            </button>
            <button
              onClick={() =>
                handleMessageBoxClick(
                  application?.user_id,
                  application?.freelancer
                )
              }
              className="secondary-btn in-dark w-button"
            >
              Message
            </button>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <div className="font-bold text-white text-base w-[fit-content] max-w-[320px]">
            {application?.freelancer?.title}
          </div>
        </div>

        <div className="text-base font-bold">{application?.name}</div>
        <div className="text-base">
          <div>
            <span className="font-bold ">Cover Letter - </span>
            {/* TODO: Implement cover letters */}
            {/* {application.freelancer.bio
                                            .split("\n")
                                            .map((line, index) => (
                                                <span key={index}>{line}</span>
                                            ))} */}
            Hello, I would like to help you! I have 4+ years Experience with web
            3, so i’ll make things work properly. Feel free to communicate!
          </div>
        </div>

        <div className="flex-row flex justify-between">
          <div className="text-base">
            <h3 className="text-base">Attachment(s)</h3>
            <div className="flex p-3 gap-2">
              {/* TODO: Implement */}
              <FaPaperclip />
              <div className="text-[#ffffff80] text-[16px]">
                https://www.behance.net/abbioty
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-2 flex-col items-center">
              <span className="font-bold text-primary">
                Milestones ({application?.milestones?.length})
              </span>
              <div className="text-[#ffffff80] text-[16px]">
                ${Number(application?.required_funds).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
