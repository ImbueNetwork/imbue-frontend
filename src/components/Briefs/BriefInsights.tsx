import React from "react";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import { Brief } from "@/model";
import { redirect } from "@/utils";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

interface BriefInsightsProps {
  brief: Brief;
}
TimeAgo.addDefaultLocale(en);

export const BriefInsights = ({ brief }: BriefInsightsProps) => {
  const timeAgo = new TimeAgo("en-US");
  const timePosted = timeAgo.format(new Date(brief?.created));

  const viewFullBrief = () => {
    redirect(`briefs/${brief.id}/`);
  };

  return (
    <div className="flex flex-row bg-[#2c2c2c] border border-solid border-[#ffffff40] rounded-[20px] p-[50px]">
      <div className="flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] mr-[5%]">
        <div className="brief-title">
          <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
            {brief.headline}
          </h3>
          <span
            className="text-[#b2ff0b] cursor-pointer text-base font-bold !m-0 !p-0 relative top-1"
            onClick={viewFullBrief}
          >
            View full brief
          </span>
        </div>
        <div className="text-inactive">
          <p className="text-base">{brief.description}</p>
        </div>
        <p className="text-inactive text-base leading-[1.5] font-bold m-0 p-0">
          Posted {timePosted}{" "}
        </p>
      </div>
      <div className="flex flex-col gap-[50px] flex-grow flex-shrink-0 basis-[20%]">
        <div className="insight-item">
          <RiShieldUserLine color="var(--theme-white)" size={24} />
          <div className="insight-value">
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
              {brief.experience_level}
            </h3>
            <div className="text-inactive">Experience Level</div>
          </div>
        </div>
        <div className="insight-item">
          <FaDollarSign color="var(--theme-white)" size={24} />
          <div className="insight-value">
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
              ${Number(brief.budget).toLocaleString()}
            </h3>
            <div className="text-inactive">Fixed Price</div>
          </div>
        </div>
        <div className="insight-item">
          <FaRegCalendarAlt color="var(--theme-white)" size={24} />
          <div className="insight-value">
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
              {brief.duration}
            </h3>
            <div className="text-inactive">Project length</div>
          </div>
        </div>
      </div>
    </div>
  );
};
