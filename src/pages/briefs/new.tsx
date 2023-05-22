import React, { useState } from "react";
import { Option } from "@/components/Option";
import { ProgressBar } from "@/components/ProgressBar";
import { TagsInput } from "@/components/TagsInput";
import { TextArea } from "@/components/Briefs/TextArea";
import * as utils from "@/utils";
import {
  stepData,
  scopeData,
  timeData,
  experiencedLevel,
  nameExamples,
  suggestedIndustries,
  suggestedSkills,
} from "@/config/briefs-data";
import * as config from "@/config";
import { BriefInfo, BriefProps } from "@/types/briefTypes";
import { getServerSideProps } from "@/utils/serverSideProps";
import styles from "../../styles/modules/newBrief.module.css";

const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};

async function invokeBriefAPI(brief: BriefInfo) {
  const resp = await fetch(`${config.apiBase}/briefs/`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify({ brief }),
  });

  if (resp.ok) {
    // could be 200 or 201
    // Brief API successfully invoked
    console.log("Brief created successfully via Brief REST API");
  }
}

const NewBrief = (props: BriefProps): JSX.Element => {
  const [step, setStep] = useState(0);
  const [headline, setHeadline] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [expId, setExpId] = useState<number>();
  const [scopeId, setScopeId] = useState<number>();
  const [durationId, setDurationId] = useState<number>();
  const [budget, setBudget] = useState<number>();

  const NamePanel = (
    <>
      <p className={styles.fieldName}>Write a headline for your brief</p>
      <div className={styles.namePanelInputWrapper}>
        <textarea
          className={styles.briefDetailFieldInput}
          data-testid="headline-input"
          placeholder="Enter the name of your project"
          name="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>
      <p className={styles.fieldName}>Examples</p>
      <div className={styles.namePanelNameExamples}>
        {nameExamples.map((name, index) => (
          <p className={styles.namePanelNameExample} key={index}>
            {name}
          </p>
        ))}
      </div>
    </>
  );

  const IndustriesPanel = (
    <>
      <p className={styles.fieldName}>Search industries or add your own</p>
      <div className={styles.industryContainer}>
        <TagsInput
          suggestData={suggestedIndustries}
          data-testid="industries-input"
          tags={industries}
          onChange={(tags: string[]) => setIndustries(tags)}
        />
      </div>
    </>
  );

  const DescriptionPanel = (
    <div className={styles.descriptionPanel}>
      <p className={styles.fieldName}>
        Describe your project in a few sentences
      </p>
      <div className={styles.descriptionContainer}>
        <TextArea
          data-testid="description-input"
          value={description}
          name="description"
          maxLength={5000}
          className="text-black"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
        />
      </div>
    </div>
  );

  const SkillsPanel = (
    <>
      <p className={styles.fieldName}>Search the skills</p>
      <div className={styles.skillsContainer}>
        <TagsInput
          suggestData={suggestedSkills}
          tags={skills}
          onChange={(tags: string[]) => setSkills(tags)}
        />
      </div>
    </>
  );

  const ExperienceLevelPanel = (
    <div className={styles.experienceLevelContainer}>
      {experiencedLevel.map(({ label, value }, index) => (
        <Option
          label={label}
          value={value}
          key={index}
          checked={expId === value}
          onSelect={() => setExpId(value)}
        />
      ))}
    </div>
  );

  const ScopePanel = (
    <div className={styles.scopeContainer}>
      {scopeData.map(({ label, value, description }, index) => (
        <Option
          label={label}
          value={value}
          key={index}
          checked={scopeId === value}
          onSelect={() => setScopeId(value)}
        >
          {description ? (
            <div className={styles.scopeItemDescription}>{description}</div>
          ) : (
            <></>
          )}
        </Option>
      ))}
    </div>
  );

  const TimePanel = (
    <div className={styles.timeContainer}>
      {timeData.map(({ label, value }, index) => (
        <Option
          label={label}
          value={value}
          key={index}
          checked={durationId === value}
          onSelect={() => setDurationId(value)}
        />
      ))}
    </div>
  );

  const BudgetPanel = (
    <div>
      <p className={styles.fieldName}>Maximum project budget (USD)</p>
      <div className={styles.budgetInputContainer}>
        <input
          className={styles.briefDetailFieldInput}
          style={{ paddingLeft: "24px", height: "auto" }}
          type="number"
          data-testid="budget-input"
          value={budget || ""}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <div className={styles.budgetCurrencyContainer}>$</div>
      </div>
      <div className={styles.budgetDescription}>
        You will be able to set milestones which divide your project into
        manageable phases.
      </div>
    </div>
  );

  const ConfirmPanel = (
    <div className={styles.descriptionPanel}>
      <p className={styles.fieldName}>Thank you for your submission!</p>
    </div>
  );

  const panels = [
    NamePanel,
    IndustriesPanel,
    DescriptionPanel,
    SkillsPanel,
    ExperienceLevelPanel,
    ScopePanel,
    TimePanel,
    BudgetPanel,
    ConfirmPanel,
  ];
  const validate = (): boolean => {
    // TODO: show notification
    if (step === 0 && !headline) {
      return false;
    }
    if (step === 1 && !industries.length) {
      return false;
    }
    if (step === 2 && !description) {
      // TODO: minimum required length for description
      return false;
    }
    if (step === 3 && !skills.length) {
      return false;
    }
    if (step === 4 && expId === undefined) {
      return false;
    }
    if (step === 5 && !scopeId) {
      return false;
    }
    if (step === 6 && durationId === undefined) {
      return false;
    }
    if (step === 7 && !budget) {
      return false;
    }
    return true;
  };

  const onReviewPost = async () => {
    //TODO: implement api call
    try {
      const user_id = (await utils.getCurrentUser())?.id;
      const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: postAPIHeaders,
        method: "post",
        body: JSON.stringify({
          headline,
          industries,
          description,
          scope_id: scopeId,
          experience_id: expId,
          duration_id: durationId,
          skills,
          budget,
          user_id,
        }),
      });
      if (resp.ok) {
        // could be 200 or 201
        // Brief API successfully invoked
        console.log("Brief created successfully via Brief REST API");
      } else {
        console.log("Failed to submit the brief");
      }
    } catch (error) {
      console.log(error);
    }
    setStep(step + 1);
  };

  return (
    <div className="h-[90%] flex">
      <div className={`${styles.newBriefContainer} hq-layout`}>
        <div className={styles.leftPanel}>
          <ProgressBar
            titleArray={["Description", "Skills", "Scope", "Budget"]}
            currentValue={stepData[step].progress}
          />
          <h1 className={styles.heading}>{stepData[step].heading}</h1>
          {stepData[step].content.split("\n").map((content, index) => (
            <p className={styles.help} key={index}>
              {content}
            </p>
          ))}
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.contents}>{panels[step] ?? <></>}</div>
          <div className={styles.buttons}>
            {step >= 1 && (
              <button
                className="secondary-btn !mt-0"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}

            {step === stepData.length - 1 ? (
              <button
                className="primary-btn in-dark w-button"
                onClick={() => utils.redirect("briefs")}
              >
                Discover Briefs
              </button>
            ) : step === stepData.length - 2 ? (
              <button
                className="primary-btn in-dark w-button !mt-0"
                disabled={!validate()}
                data-testid="submit-button"
                onClick={() => onReviewPost()}
              >
                Submit
              </button>
            ) : (
              <button
                className="primary-btn in-dark w-button !mt-0"
                data-testid="next-button"
                onClick={() => setStep(step + 1)}
                disabled={!validate()}
              >
                {stepData[step].next ? `Next: ${stepData[step].next}` : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { getServerSideProps };

export default NewBrief;
