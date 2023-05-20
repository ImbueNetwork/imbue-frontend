/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  stepData,
  freelancedBefore,
  freelancingGoal,
  importInformation,
  suggestedFreelancingSkills,
  suggestedServices,
  suggestedLanguages,
} from "@/config/freelancer-data";
import { getDefaultFreelancer, User } from "@/model";
import { TagsInput } from "../../components/TagsInput";
import * as utils from "@/utils";
import {
  createFreelancingProfile,
  freelancerExists,
} from "@/redux/services/freelancerService";
import { useRouter } from "next/router";
import { FreelancerProps } from "@/types/freelancerTypes";
import styles from "../../styles/modules/Freelancers/new-Freelancer.module.css";

const Freelancer = ({ user }: FreelancerProps): JSX.Element => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const displayName = user?.display_name;
  const [freelancingBefore, setFreelancingBefore] = useState("");
  const [goal, setGoal] = useState("");
  const [resume, setResume] = useState("");
  const [title, setTitle] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const HelloPanel = (
    <div className={styles.helloPanel}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content
          .split("\n")
          .map((line: string, index: number) => (
            <p key={index}>{line}</p>
          ))}
      </div>
    </div>
  );

  const FreelanceExperience = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content
          .split("\n")
          .map((line: string, index: number) => (
            <p key={index}>{line}</p>
          ))}
      </div>
      <div className={styles.freelanceXpOptions}>
        {freelancedBefore.map(({ label, value }, index) => (
          <div
            key={index}
            data-testid={`freelance-xp-${index}`}
            className={`${styles.freelanceXpItem} ${
              freelancingBefore === value ? styles.active : ""
            }`}
            onClick={() => setFreelancingBefore(value)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  const FreelancingGoal = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.freelanceXpOptions}>
        {freelancingGoal.map(({ label, value }, index) => (
          <div
            key={index}
            data-testid={`freelance-goal-${index}`}
            className={`${styles.freelanceXpItem} ${
              goal === value ? styles.active : ""
            }`}
            onClick={() => setGoal(value)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  const ImportResume = (
    // TODO:
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.freelanceXpOptions}>
        {importInformation.map(({ label, value }, index) => (
          <div
            key={index}
            className={`${styles.freelanceXpItem} ${
              resume === value ? styles.active : ""
            }`}
            onClick={() => setResume(value)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  const TitlePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <input
          className={styles.fieldInput}
          placeholder="Enter your title"
          data-testid="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );

  const ExperiencePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );

  const EducationPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );

  const LanguagePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className="mt-6 pb-20">
        <TagsInput
          suggestData={suggestedLanguages}
          data-testid="languages"
          tags={languages}
          onChange={(tags: string[]) => setLanguages(tags)}
        />
      </div>
    </div>
  );

  const SkillsPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <h3 className="text-lg text-black mt-5">Your Skills</h3>
      <div className="mt-5 mb-20">
        <TagsInput
          suggestData={suggestedFreelancingSkills}
          tags={skills}
          onChange={(tags: string[]) => setSkills(tags)}
        />
      </div>
    </div>
  );

  const BioPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <div className={styles.namePanelInputWrapper}>
        <textarea
          className={`${styles.fieldInput} ${styles.large}`}
          placeholder="Enter your bio"
          data-testid="bio"
          name="bio"
          maxLength={5000}
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
    </div>
  );

  const ServicesPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className="mt-5 mb-20">
        <TagsInput
          suggestData={suggestedServices}
          tags={services}
          onChange={(tags: string[]) => setServices(tags)}
        />
      </div>
    </div>
  );

  const ConfirmPanel = (
    <div className={styles.descriptionPanel}>
      <p>Thank you for your submission!</p>
    </div>
  );

  const panels = [
    HelloPanel,
    FreelanceExperience,
    FreelancingGoal,
    // ImportResume,
    TitlePanel,
    // ExperiencePanel,EducationPanel,
    LanguagePanel,
    SkillsPanel,
    BioPanel,
    ServicesPanel,
    ConfirmPanel,
  ];

  const validate = (): boolean => {
    // TODO: show notification
    if (step === 1 && !freelancingBefore) {
      return false;
    }
    if (step === 2 && !goal) {
      return false;
    }
    if (step === 3 && !title) {
      // TODO: minimum required length for description
      return false;
    }
    // if (step === 4 && !languages.length) {
    //   return false;
    // }
    if (step === 5 && !skills.length) {
      return false;
    }
    if (step === 6 && !bio) {
      return false;
    }
    if (step === 7 && !services.length) {
      return false;
    }
    return true;
  };

  async function createProfile() {
    try {
      const response: any = await createFreelancingProfile({
        id: 0,
        bio,
        education: "",
        experience: freelancingBefore,
        freelanced_before: freelancingBefore,
        freelancing_goal: goal,
        work_type: "",
        skills,
        title,
        languages,
        services,
        user_id: user?.id,
        username: user?.display_name,
        display_name: user?.display_name,
        discord_link: "",
        facebook_link: "",
        telegram_link: "",
        twitter_link: "",
        clients: [],
        client_images: [],
        num_ratings: 0,
        profileImageUrl: require("@/assets/images/profile-image.png"),
      });

      if (response.status === 201) {
        setStep(step + 1);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.freelancerDetailsContainer}>
      <div className={styles.mainPanel}>
        <div className={styles.freelancerContents}>
          <h2 data-testid="heading" className="text-theme-secondary">
            {stepData[step].heading.replace("{name}", displayName)}
          </h2>
          {panels[step] ?? <></>}
        </div>
        <div className={step === 0 ? styles.buttonLeft : styles.buttonRight}>
          {step >= 1 && (
            <button
              className="secondary-btn !mt-0"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}

          {step === 0 ? (
            <button
              className="primary-btn in-dark w-button mr-auto mt-6"
              onClick={() => setStep(1)}
              data-testid="get-started-button"
            >
              Get Started!
            </button>
          ) : step === stepData.length - 1 ? (
            <button
              className="primary-btn in-dark w-button"
              onClick={() => utils.redirect("briefs")}
            >
              Discover Briefs
            </button>
          ) : step === stepData.length - 2 ? (
            <button
              className="primary-btn in-dark w-button"
              data-testid="submit-button"
              disabled={!validate()}
              onClick={() => createProfile()}
            >
              Submit
            </button>
          ) : (
            <button
              className="primary-btn in-dark w-button !mt-0"
              data-testid="next-button"
              disabled={!validate()}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Freelancer.getInitialProps = async () => {
  const userResponse = await utils.getCurrentUser();

  if (!userResponse) {
    return {
      user: undefined,
    };
  }

  return { user: userResponse };
};

export default Freelancer;
