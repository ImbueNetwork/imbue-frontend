/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { timeData } from "@/config/briefs-data";
import { Brief, User } from "@/model";
import { getBrief, updateBriefById } from "@/redux/services/briefService";
import { checkEnvironment, getCurrentUser } from "@/utils";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import { useRouter } from "next/router";
import FullScreenLoader from "@/components/FullScreenLoader";
import styles from "@/styles/modules/newBrief.module.css";
import { TagsInput } from "@/components/TagsInput";
import {
  scopeData,
  experiencedLevel,
  suggestedIndustries,
  suggestedSkills,
} from "@/config/briefs-data";
import { TextArea } from "@/components/Briefs/TextArea";
import { Option } from "@/components/Option";
import styled from "@emotion/styled";
import { postAPIHeaders } from "@/config";

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

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

export const EditProposal = (): JSX.Element => {
  const [brief, setBrief] = useState<Brief | any>();
  const [user, setUser] = useState<User | null>();
  const [industries, setIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [headline, setHeadline] = useState("");
  const [expId, setExpId] = useState<number>();
  const [scopeId, setScopeId] = useState<number>();
  const [durationId, setDurationId] = useState<number>();
  const [budget, setBudget] = useState<number | bigint | any>();
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;
  const [skills, setSkills] = useState<string[]>([]);
  useEffect(() => {
    getCurrentUserBrief();
  }, [briefId]);

  const getCurrentUserBrief = async () => {
    const userResponse = await getCurrentUser();
    setUser(userResponse);
    const briefResponse: Brief | undefined = await getBrief(briefId);
    const userOwnsBriefs = briefResponse?.user_id == userResponse?.id;
    if (briefResponse && userResponse && userOwnsBriefs) {
      const skillNames = briefResponse?.skills?.map?.((item) => item?.name);
      const industryNames = briefResponse?.industries?.map?.(
        (item) => item?.name
      );
      const projectHeadline: any = briefResponse?.headline;
      const projectBudget: any = briefResponse?.budget;
      const projectDescription = briefResponse?.description;
      const projectScope = briefResponse?.scope_id;
      const projectExperience = briefResponse?.experience_id;
      const projectDuration = briefResponse?.duration_id;

      setBrief(briefResponse);
      setSkills(skillNames);
      setIndustries(industryNames);
      setBudget(projectBudget);
      setDescription(projectDescription);
      setScopeId(projectScope);
      setExpId(projectExperience);
      setDurationId(projectDuration);
      setHeadline(projectHeadline);
    } else {
      router.push(`/briefs/${briefId}`);
    }
  };

  async function handleSubmit() {
    await editProject();
  }

  async function editProject() {
    setLoading(true);
    const updateBriefResponse = await updateBriefById({
      description,
      headline: headline,
      industries,
      scope_id: scopeId,
      skills,
      duration_id: durationId,
      experience_id: expId,
      budget,
      brief_id: briefId,
    });
    setLoading(false);

    if (updateBriefResponse) {
      router.push(`/briefs/${briefId}`);
    }
  }

  function filterStrings(arr1: string[], arr2: string[]): string[] {
    return arr1.filter((str) => !arr2.includes(str.toLocaleLowerCase()));
  }

  return (
    <div className="flex flex-row max-width-868px:block hq-layout max-md:px-7">
      <header
        className="
      max-w-[400px] 
      p-0 pb-[40px] 
      max-width-868px:w-[auto] 
      max-width-868px:max-w-[unset]
      md:w-[70%]
      md:mr-20 
      "
      >
        <h1 className=" text-4xl leading-[50px] !text-white m-0 font-normal mx-0">
          Edit Brief Details
        </h1>
      </header>
      <div className="imbu-proposals-draft-submission-form">
        <fieldset>
          <p className={`${styles.fieldName} !text-white !text-3xl`}>
            Headline
          </p>
          <div className={styles.budgetInputContainer}>
            <input
              className={styles.briefDetailFieldInput}
              style={{ paddingLeft: "24px", height: "auto" }}
              type="text"
              value={headline || ""}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <h1 className="!text-3xl m-0 font-normal my-0 mx-0">Skills</h1>
          <div className={styles.skillsContainer}>
            <TagsInput
              suggestData={filterStrings(suggestedSkills, skills)}
              tags={skills}
              onChange={(tags: string[]) => setSkills([...tags])}
            />
          </div>

          <h1 className="!text-3xl m-0 font-normal my-0 mx-0">Industries</h1>
          <div className={styles.industryContainer}>
            <TagsInput
              suggestData={filterStrings(suggestedIndustries, industries)}
              data-testid="industries-input"
              tags={industries}
              onChange={(tags: string[]) => {
                setIndustries([...tags]);
              }}
            />
          </div>

          <div>
            <p className={`${styles.fieldName} !text-white !text-3xl`}>
              Maximum project budget (USD)
            </p>
            <div className={styles.budgetInputContainer}>
              <input
                className={styles.briefDetailFieldInput}
                style={{ paddingLeft: "24px", height: "auto" }}
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div className={styles.budgetCurrencyContainer}>$</div>
            </div>
            <div
              className={`${styles.budgetDescription} !text-white !mb-0 !mt-0`}
            >
              You will be able to set milestones which divide your project into
              manageable phases.
            </div>
          </div>
        </fieldset>

        <fieldset>
          <h1 className="!text-3xl m-0 font-normal my-0 mx-0">Description</h1>
          <div className={styles.descriptionContainer}>
            <TextArea
              value={description}
              name="description"
              maxLength={5000}
              className="text-black"
              rows={10}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <SpacedRow>
            <div className={styles.scopeContainer}>
              <h1 className="!text-3xl m-0 font-normal my-0 mx-0">Scope</h1>
              {scopeData.map(({ label, value, description }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={scopeId === value}
                  onSelect={() => setScopeId(value)}
                  textclass="!text-white"
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className="!text-3xl m-0 font-normal my-0 mx-0">
                Experience
              </h1>

              {experiencedLevel.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={expId === value}
                  onSelect={() => setExpId(value)}
                  textclass="!text-white"
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className="!text-3xl m-0 font-normal my-0 mx-0">Duration</h1>
              {timeData.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={durationId === value}
                  onSelect={() => setDurationId(value)}
                  textclass="!text-white"
                />
              ))}
            </div>
          </SpacedRow>
        </fieldset>

        <fieldset>
          <div className="buttons-container">
            <button
              disabled={false}
              className="primary-btn in-dark w-button w-full"
              onClick={() => handleSubmit()}
            >
              Submit
            </button>
          </div>
        </fieldset>
      </div>

      {loading && <FullScreenLoader />}
    </div>
  );
};

export default EditProposal;
