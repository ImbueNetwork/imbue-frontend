import DropdownSelect from "@/components/CustomMaterialComponents/DropdownSelect";
import TextArea from "@/components/CustomMaterialComponents/TextArea";
import TextInput from "@/components/CustomMaterialComponents/TextInput";
import React from "react";
import styled from "@emotion/styled";
import CustomButton from "@/components/CustomMaterialComponents/Button";
import { Buttons } from "@/utils/helper";
import { categories } from "@/constants/constants";
import * as model from "@/model";
import { useWindowSize } from "@/hooks";

const SpacedRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  @media screen and (max-width: 500px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
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

const CategoriesData = Object.entries(categories).map(
  ([category, subcategies], index) => {
    return {
      label: category,
      body: subcategies.join("; "),
      value: `${category}  ${subcategies.join("; ")}`,
    };
  }
);

const CurrencyData = Object.keys(model.Currency)
  .filter((v) => !isNaN(Number(v)))
  .map((currency) => {
    return {
      label: model.Currency[currency as any],
      value: model.Currency[currency as any],
    };
  });

const Draft = (): JSX.Element => {
  const size = useWindowSize();
  return (
    <div className="flex flex-row max-width-868px:block">
      <header
        className="
      w-[40%] 
      max-w-[400px] 
      p-0 pb-[40px] 
      max-width-868px:w-[auto] 
      max-width-868px:max-w-[unset]"
      >
        <h1 className="text-[54px] m-0 font-normal my-[20px] mx-0">
          Bring your project to life
        </h1>
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
              placeholder="Project name*"
              message="The name of the project"
            />
            <TextInput
              name="website"
              placeholder="Website*"
              message="A website where contributors can find out more"
            />
            <TextInput
              name="logo"
              placeholder="Logo*"
              message="A URL to an image file."
            />
          </fieldset>

          <fieldset>
            <legend className="label">
              Describe what you&apos;ll be creating
            </legend>

            <DropdownSelect
              error={false}
              data={CategoriesData}
              placeholder="Category"
              noOfItemsPerList={2}
            />

            <TextArea
              name="project"
              placeholder="Tell us about your project*"
              mt={-16}
            />
          </fieldset>

          <fieldset>
            <legend className="label">
              How much funding will your project need?
            </legend>

            <SpacedRow>
              <DropdownSelect
                data={CurrencyData}
                placeholder="Currency*"
                widthPercent={size?.width < 500 ? 100 : 35}
                error={false}
                noOfItemsPerList={1}
              />
              <TextInput
                widthPercent={size?.width < 500 ? 100 : 50}
                name="funds"
                placeholder="Funds Required*"
                message="The total amount required for the project"
                inputType="number"
                value={7}
                showSuffix
                mt={size?.width < 500 ? -16 : 0}
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
              placeholder="What is your first milestone?*"
              message="A short summary of a concrete deliverable."
            />
            <TextInput
              name="unlock"
              placeholder="Percent to unlock?*"
              message="The sum of all milestones must be 100%."
              showSuffix
              suffixText=""
              inputType="number"
            />

            <CustomButton
              text="Add Another Milestone"
              btnWrapStyle={{ height: 64, marginTop: 20 }}
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
