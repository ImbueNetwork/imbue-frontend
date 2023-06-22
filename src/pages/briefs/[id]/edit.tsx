/* eslint-disable react-hooks/exhaustive-deps */
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { TextArea } from '@/components/Briefs/TextArea';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import { Option } from '@/components/Option';
import SuccessScreen from '@/components/SuccessScreen';
import { TagsInput } from '@/components/TagsInput';

import { timeData } from '@/config/briefs-data';
import {
  experiencedLevel,
  scopeData,
  suggestedIndustries,
  suggestedSkills,
} from '@/config/briefs-data';
import { Brief } from '@/model';
import { getBrief, updateBriefById } from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';
import styles from '@/styles/modules/newBrief.module.css';

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

export const EditProposal = (): JSX.Element => {
  // FIXME: brief
  const [_brief, setBrief] = useState<Brief | any>();
  // FIXME: user
  const { user } = useSelector((state: RootState) => state.userState)
  const [industries, setIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [headline, setHeadline] = useState('');
  const [expId, setExpId] = useState<number>();
  const [scopeId, setScopeId] = useState<number>();
  const [durationId, setDurationId] = useState<number>();
  const [budget, setBudget] = useState<number | bigint | any>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;
  const [skills, setSkills] = useState<string[]>([]);
  useEffect(() => {
    router.isReady && getCurrentUserBrief();
  }, [briefId]);

  const getCurrentUserBrief = async () => {
    try {
      const briefResponse: Brief | undefined = await getBrief(briefId);
      const userOwnsBriefs = briefResponse?.user_id == user?.id;
      if (briefResponse && user?.username && userOwnsBriefs) {
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
    } catch (error) {
      // FIXME: error handling
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit() {
    await editProject();
  }

  async function editProject() {
    try {
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
      if (updateBriefResponse) {
        setSuccess(true);
      } else {
        setError({ message: 'Could not update brief. Please try again' });
      }
    } catch (error) {
      setError({ message: 'Could not update brief. Please try again' });
    } finally {
      setLoading(false);
    }
  }

  function filterStrings(arr1: string[], arr2: string[]): string[] {
    return arr1.filter((str) => !arr2.includes(str.toLocaleLowerCase()));
  }

  return (
    <div className='flex flex-row max-width-868px:block hq-layout max-md:px-7'>
      <header
        className='
      max-w-[400px] 
      p-0 pb-[40px] 
      max-width-868px:w-[auto] 
      max-width-868px:max-w-[unset]
      md:w-[70%]
      md:mr-20 
      '
      >
        <h1 className=' text-4xl leading-[50px] !text-white m-0 font-normal mx-0'>
          Edit Brief Details
        </h1>
      </header>
      <div className='imbu-proposals-draft-submission-form'>
        <fieldset>
          <p className={`${styles.fieldName} !text-white !text-3xl`}>
            Headline
          </p>
          <div className={styles.budgetInputContainer}>
            <input
              className={styles.briefDetailFieldInput}
              style={{ paddingLeft: '24px', height: 'auto' }}
              type='text'
              value={headline || ''}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>Skills</h1>
          <div className={styles.skillsContainer}>
            <TagsInput
              suggestData={filterStrings(suggestedSkills, skills)}
              tags={skills}
              onChange={(tags: string[]) => setSkills([...tags])}
            />
          </div>

          <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>Industries</h1>
          <div className={styles.industryContainer}>
            <TagsInput
              suggestData={filterStrings(suggestedIndustries, industries)}
              data-testid='industries-input'
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
                style={{ paddingLeft: '24px', height: 'auto' }}
                type='number'
                value={budget || ''}
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
          <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>Description</h1>
          <div className={styles.descriptionContainer}>
            <TextArea
              value={description}
              name='description'
              maxLength={5000}
              className='text-black'
              rows={10}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <SpacedRow>
            <div className={styles.scopeContainer}>
              <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>Scope</h1>
              {scopeData.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={scopeId === value}
                  onSelect={() => setScopeId(value)}
                  textclass='!text-white'
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>
                Experience
              </h1>

              {experiencedLevel.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={expId === value}
                  onSelect={() => setExpId(value)}
                  textclass='!text-white'
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className='!text-3xl m-0 font-normal my-0 mx-0'>Duration</h1>
              {timeData.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={durationId === value}
                  onSelect={() => setDurationId(value)}
                  textclass='!text-white'
                />
              ))}
            </div>
          </SpacedRow>
        </fieldset>

        <fieldset>
          <div className='buttons-container'>
            <button
              disabled={false}
              className='primary-btn in-dark w-button w-full'
              onClick={() => handleSubmit()}
            >
              Submit
            </button>
          </div>
        </fieldset>
      </div>

      {loading && <FullScreenLoader />}

      <SuccessScreen
        title={'Your have successfully updated this brief'}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/briefs/${briefId}/`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            See Updated Brief
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </SuccessScreen>

      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>
    </div>
  );
};

export default EditProposal;
