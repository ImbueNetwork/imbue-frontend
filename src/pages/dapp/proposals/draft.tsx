import DropdownSelect from "@/components/dropdownSelect";
import TextArea from "@/components/textArea";
import TextInput from "@/components/textInput";
import React from "react";
import styled from "@emotion/styled";
import CustomButton from "@/components/Button";
import { Buttons } from "@/utils/helper";

const SpacedRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

const saveDraftStyle = {
  btnWrap: {
    marginTop: 16,
    height: 64,
    backgroundColor: "var(--theme-secondary)",
  },
  hoverStyle: {
    backgroundColor: "var(--theme-secondary)",
  },
};

const Draft = (): JSX.Element => {
  return (
    <div className="proposal-editor-continer">
      <header className="header-h1-text-container">
        <h1 className="header-text">Bring your project to life</h1>
      </header>
      <div className="imbu-proposals-draft-submission-form">
        <form
          id="grant-submission-form"
          name="grant-submission-form"
          data-name="Grant Submission Form"
          method="get"
          autoComplete="off"
          noValidate
        >
          <fieldset>
            <legend className="label">First, some basic info</legend>

            <TextInput
              name="project_name"
              placeholder="Project name"
              message="The name of the project"
            />
            <TextInput
              name="website"
              placeholder="Website"
              message="A website where contributors can find out more"
            />
            <TextInput
              name="logo"
              placeholder="Logo"
              message="A URL to an image file."
            />
          </fieldset>

          <fieldset>
            <legend className="label">
              Describe what you&apos;ll be creating
            </legend>

            <DropdownSelect error={false} />

            <TextArea
              name="project"
              placeholder="Tell us about your project"
              mt={7}
            />
          </fieldset>

          <fieldset>
            <legend className="label">
              How much funding will your project need?
            </legend>

            <SpacedRow>
              <DropdownSelect widthPercent={35} error={false} />
              <TextInput
                widthPercent={50}
                name="funds"
                placeholder="Funds Required"
                message="The total amount required for the project"
                inputType="number"
                value={7}
                showSuffix
              />
            </SpacedRow>
            <TextInput
              name="address"
              placeholder="Address"
              message="Your wallet address"
              disabled
              value="AWdmnd345ydgWYVSJKNydghviuhdgadyiuvhskuvhwiruvk"
            />
          </fieldset>

          <fieldset>
            <legend className="label">Milestones</legend>

            <TextInput
              name="milestone"
              placeholder="What is your first milestone?"
              message="A short summary of a concrete deliverable."
            />
            <TextInput
              name="unlock"
              placeholder="Percent to unlock?"
              message="The sum of all milestones must be 100%."
              showSuffix
              suffixText=""
              inputType="number"
            />

            <CustomButton
              text="Add Another Milestone"
              btnWrapStyle={{ height: 64 }}
            />
            <CustomButton
              text="Save Draft Propsal"
              variant={Buttons.CONTAINED}
              btnWrapStyle={saveDraftStyle.btnWrap}
              hoverStyle={saveDraftStyle.hoverStyle}
            />
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Draft;
