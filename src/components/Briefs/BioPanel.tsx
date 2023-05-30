import { Brief } from "@/model";
import React from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { FiEdit } from "react-icons/fi";
import { useRouter } from "next/router";

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

type BioPanelData = {
  brief: Brief;
  projectCategories: string[];
  isOwnerOfBrief?: boolean | null;
};

const BioPanel = ({
  brief,
  projectCategories,
  isOwnerOfBrief,
}: BioPanelData) => {
  const timePosted = timeAgo.format(new Date(brief.created));
  const router = useRouter();

  return (
    <div className="brief-bio py-5 px-10 max-width-750px:!p-5 max-width-750px:!w-full max-width-1100px:p-[1rem]">
      <div className="subsection max-width-750px:!my-0">
        <div className="flex flex-wrap flex-col items-start">
          <div className="header">
            <h2>{brief.headline}</h2>
          </div>

          {isOwnerOfBrief && (
            <button
              className="primary-btn 
              in-dark w-[auto] 
              max-width-750px:!px-4 
              flex 
              items-center 
              gap-2
              my-4
              !self-start
              "
              onClick={() => {
                router.push(`/briefs/${brief?.id}/edit`);
              }}
            >
              Edit Brief
              <FiEdit size={16} />
            </button>
          )}
        </div>
        <span className="time_posted primary-text mt-3">
          Posted {timePosted} by {brief.created_by}
        </span>
      </div>

      <div className="subsection">
        <h3>Project Description</h3>
        <p className="mt-4">{brief.description}</p>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Project Category</h3>
        </div>
        <div className="list-row">
          {projectCategories?.map((category, index) => (
            <p
              className="rounded-full text-black bg-white px-4 py-2"
              key={index}
            >
              {category}
            </p>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Key Skills And Requirements</h3>
        </div>
        <div className="list-row">
          {brief.skills?.map((skill, index) => (
            <p
              className="rounded-full text-black bg-white px-4 py-2"
              key={index}
            >
              {skill.name}
            </p>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Project Scope</h3>
        </div>
        <span>{brief.scope_level}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Experience Level Required</h3>
        </div>
        <span>{brief.experience_level}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Estimated Length</h3>
        </div>
        <span>{brief.duration}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Total Budget</h3>
        </div>
        <span>${Number(brief.budget).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default BioPanel;
