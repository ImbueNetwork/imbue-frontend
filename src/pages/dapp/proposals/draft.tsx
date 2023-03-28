import DropdownSelect from "@/components/dropdownSelect";
import TextInput from "@/components/textInput";
import React from "react";

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
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Draft;
