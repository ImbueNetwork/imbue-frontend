/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Brief, User } from "@/model";
import { getBriefApplications } from "@/redux/services/briefService";
import { BriefInsights } from "@/components/Briefs/BriefInsights";
import { fetchUser, redirect } from "@/utils";
import ChatPopup from "@/components/ChatPopup";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { StyledEngineProvider } from "@mui/system";
import { ApplicationContainer } from "@/components/Briefs/ApplicationContainer";

interface BriefApplicationsProps {
  brief: Brief;
  browsingUser: User;
}

const BriefApplications = ({ brief, browsingUser }: BriefApplicationsProps) => {
  const [briefApplications, setBriefApplications] = useState<any[]>();
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [sortValue, setSortValue] = useState<string>("match");

  const handleMessageBoxClick = async (user_id: number) => {
    if (browsingUser) {
      setTargetUser(await fetchUser(user_id));
      setShowMessageBox(true);
    } else {
      redirect("login", `/dapp/briefs/${brief.id}/`);
    }
  };

  const setup = async () => {
    if (brief?.id) {
      const response = await getBriefApplications(brief.id);
      setBriefApplications(response);
    }
  };

  useEffect(() => {
    setup();
  }, []);

  const redirectToApplication = (applicationId: string) => {
    redirect(`briefs/${brief.id}/applications/${applicationId}/`);
  };

  return (
    <div className="page-wrapper">
      {browsingUser && showMessageBox && (
        <ChatPopup
          {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }}
        />
      )}
      <div className="section">
        <h3 className="section-title">Review proposals</h3>
        <BriefInsights brief={brief} />
      </div>
      <div className="section">
        <div className="w-full ml-auto flex items-end justify-between">
          <h3 className="section-title">All applicants</h3>
          <StyledEngineProvider injectFirst>
            <FormControl>
              <InputLabel id="demo-simple-select-helper-label">Sort</InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={sortValue}
                label="Sort"
                onChange={(e) => setSortValue(e.target.value)}
              >
                <MenuItem value="match">Best Match</MenuItem>
                <MenuItem value="ratings">Ratings</MenuItem>
                <MenuItem value="budget">Budget</MenuItem>
              </Select>
            </FormControl>
          </StyledEngineProvider>
        </div>
        <div className="applicants-list">
          {briefApplications?.map((application, index) => (
            <ApplicationContainer
              key={index}
              application={application}
              handleMessageBoxClick={handleMessageBoxClick}
              redirectToApplication={redirectToApplication}
            />
          ))}
        </div>
        {/* TODO Display empty if no applications */}
      </div>
    </div>
  );
};

export default BriefApplications;
