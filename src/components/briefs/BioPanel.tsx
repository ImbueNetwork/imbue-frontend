import { Brief } from "@/model";
import React from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo("en-US");

type BioPanelData = {
  brief: Brief;
  projectCategories: string[];
};

const BioPanel = ({ brief, projectCategories }: BioPanelData) => {
  const timePosted = timeAgo.format(new Date(brief.created));

  return (
    <div className="brief-bio py-5 px-10">
      <div className="subsection">
        <div className="header">
          <h2>{brief.headline}</h2>
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
