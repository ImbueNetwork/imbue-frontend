/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import styled from '@emotion/styled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  TextField,
  Tooltip,
} from '@mui/material';
import Filter from 'bad-words';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { TextArea } from '@/components/Briefs/TextArea';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import { Option } from '@/components/Option';
import SuccessScreen from '@/components/SuccessScreen';

import { timeData } from '@/config/briefs-data';
import { experiencedLevel, scopeData } from '@/config/briefs-data';
import { Brief } from '@/model';
import {
  getBrief,
  searchIndustries,
  searchSkills,
  updateBriefById,
} from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';
import styles from '@/styles/modules/newBrief.module.css';
const SpacedRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 1.5rem;

  @media screen and (max-width: 500px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

type ErrorObjectType = {
  headline: string;
  description: string;
  budget: string;
  skills: string;
  industries: string;
  message: string;
};

export const EditProposal = (): JSX.Element => {
  const filter = new Filter();
  // FIXME: brief

  /// error handling objects
  const initErrorObject: ErrorObjectType = {
    headline: '',
    description: '',
    budget: '',
    skills: '',
    industries: '',
    message: '',
  };

  const [brief, setBrief] = useState<Brief | any>();
  // FIXME: user
  const { user } = useSelector((state: RootState) => state.userState);
  const [industries, setIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState<any>();
  const [headline, setHeadline] = useState<any>();
  const [expId, setExpId] = useState<number>();
  const [scopeId, setScopeId] = useState<number>();
  const [durationId, setDurationId] = useState<number>();
  const [budget, setBudget] = useState<number | bigint | any>();
  const [verified_only, setVerified_only] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [suggestedIndustries, setSuggestedIndustries] = useState<string[]>([]);

  const [inputError, setInputError] =
    useState<ErrorObjectType>(initErrorObject);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;
  const [skills, setSkills] = useState<string[]>([]);
  useEffect(() => {
    router.isReady && getCurrentUserBrief();
  }, [briefId]);

  useEffect(() => {
    fetchSuggestedSkills();
    fetchSuggestedIndustries();
  }, []);

  const fetchSuggestedIndustries = async () => {
    const industriesRes = await searchIndustries('a');
    if (industriesRes) {
      setSuggestedIndustries(
        industriesRes?.industry.map((industries) => industries.name)
      );
    }
  };

  const fetchSuggestedSkills = async () => {
    const skillsRes = await searchSkills('');
    if (skillsRes) {
      setSuggestedSkills(skillsRes?.skills.map((skill) => skill.name));
    }
  };

  const isinputError = () => {
    if (
      inputError.headline.length ||
      inputError.description.length ||
      inputError.industries.length ||
      inputError.skills.length ||
      inputError.budget.length
    )
      return true;
    return false;
  };

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
        setVerified_only(briefResponse?.verified_only);
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
    try {
      setLoading(true);
      const updateBriefResponse = await updateBriefById({
        description: filter.clean(description),
        headline: filter.clean(headline),
        industries: industries.map((item) =>
          item.trim().length ? filter.clean(item) : ''
        ),
        scope_id: scopeId,
        skills: skills.map((item) =>
          item.trim().length ? filter.clean(item) : ''
        ),
        duration_id: durationId,
        experience_id: expId,
        budget,
        brief_id: briefId,
        verified_only,
        user_id: brief.user_id
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

  // function filterStrings(arr1: string[], arr2: string[]): string[] {
  //   return arr1.filter((str) => !arr2.includes(str.toLocaleLowerCase()));
  // }

  const validateInputLength = (
    text: string,
    min: number,
    max: number
  ): boolean => {
    return text.length >= min && text.length <= max;
  };

  const validateSkillsAndIndustry = (
    text: string,
    value: string[],
    min: number,
    max: number
  ): boolean => {
    if (text === 'skills') {
      return value.length >= min && value.length <= max;
    }
    if (text === 'industries') {
      return value.length >= min && value.length <= max;
    }
    return false;
  };

  const handleSkillChange = (val: string[]) => {
    setSkills(val);
    if (validateSkillsAndIndustry('skills', val, 3, 10)) {
      setInputError((val) => {
        return { ...val, skills: '' };
      });
    } else {
      setInputError((val) => {
        return { ...val, skills: 'Number of skills must be between 3 to 10' };
      });
    }
  };

  const searchSkill = async (name: string) => {
    const skillRes = await searchSkills(name);
    if (!skillRes || !skillRes?.skills.length) return;
    setSuggestedSkills(skillRes?.skills.map((skill) => skill.name));
  };

  const searchIndustry = async (name: string) => {
    const industriesRes = await searchIndustries(name.length > 0 ? name : 'a');
    if (!industriesRes || !industriesRes?.industry.length) return;
    setSuggestedIndustries(
      industriesRes?.industry.map((industry) => industry.name)
    );
  };

  const handleIndustriesChange = (val: string[]) => {
    setIndustries(val);
    if (validateSkillsAndIndustry('industries', val, 3, 5)) {
      setInputError((val) => {
        return { ...val, industries: '' };
      });
    } else {
      setInputError((val) => {
        return {
          ...val,
          industries: 'Number of industries must be between 3 to 5',
        };
      });
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    switch (name) {
      case 'headline':
        if (validateInputLength(value, 10, 50)) {
          setHeadline(value);
          setInputError((val) => {
            return { ...val, headline: '' };
          });
        } else {
          setHeadline(value);
          setInputError((val) => {
            return {
              ...val,
              headline: 'Headline must be between 10 and 50 characters',
            };
          });
        }
        break;
      case 'description':
        if (validateInputLength(value, 50, 5000)) {
          setDescription(value);
          setInputError((val) => {
            return {
              ...val,
              description: '',
            };
          });
        } else {
          setInputError((val) => {
            return {
              ...val,
              description: 'Description must be between 50 and 5000 characters',
            };
          });

          setDescription(value);
        }
        break;
      case 'budget':
        if (Number(value) < 10 || Number(value) > 1000000000) {
          setInputError((val) => {
            return {
              ...val,
              budget: 'Budget must be between $10 and $1,000,000,000',
            };
          });

          setBudget(value);
        }
        else if (!Number.isInteger(Number(value))) {
          setInputError((val) => {
            return {
              ...val,
              budget: 'Budget must be rounded number',
            };
          });

          setBudget(value);
        }
        else {
          setInputError((val) => {
            return {
              ...val,
              budget: '',
            };
          });
          setBudget(value);
        }
        break;
      default:
        break;
    }
  };

  const SkillPanel = () => {
    return (
      <Autocomplete
        id='tags-standard'
        data-testid='skills-input'
        multiple
        getOptionLabel={(option) => option}
        options={suggestedSkills}
        sx={{ width: '100%' }}
        onChange={(e, value) => handleSkillChange(value)}
        defaultValue={skills}
        renderInput={(params) => (
          <TextField
            color='secondary'
            autoComplete='off'
            onChange={(e) => searchSkill(e.target.value)}
            {...params}
          />
        )}
      />
    );
  };

  const IndustryPannel = () => {
    return (
      <Autocomplete
        id='tags-standard'
        data-testid='skills-input'
        multiple
        getOptionLabel={(option) => option}
        options={suggestedIndustries}
        sx={{ width: '100%' }}
        onChange={(e, value) => handleIndustriesChange(value)}
        defaultValue={industries}
        limitTags={10}
        renderInput={(params) => (
          <TextField
            color='secondary'
            autoComplete='off'
            onChange={(e) => searchIndustry(e.target.value)}
            {...params}
          />
        )}
      />
    );
  };

  return (
    <div className='flex flex-row max-width-868px:block max-md:px-7'>
      <header
        className='
      max-w-[400px] 
      p-0 lg:pb-[40px] 
      max-width-868px:w-[auto] 
      max-width-868px:max-w-[unset]
      md:w-[70%]
      md:mr-20 

      bg-white 
      lg:p-[2rem] 
      rounded-[1.25rem]
      flex
      self-start
      '
      >
        <div className='flex gap-5 items-center'>
          <Tooltip
            title='Go back to previous page'
            followCursor
            leaveTouchDelay={10}
            enterDelay={500}
            className='cursor-pointer'
          >
            <div
              onClick={() => router.back()}
              className='border border-content rounded-full p-1 flex items-center justify-center cursor-pointer relative '
            >
              <ArrowBackIcon className='h-5 w-5' color='secondary' />
            </div>
          </Tooltip>
          <h1 className='lg:text-3xl text-[1.5rem] leading-[50px] !text-imbue-purple m-0 font-normal mx-0'>
            Edit Brief Details
          </h1>
        </div>
      </header>
      <div className='imbu-proposals-draft-submission-form'>
        <fieldset className='bg-white p-[1rem] lg:p-[2rem] rounded-[1.25rem]'>
          <p
            className={`${styles.fieldName} !text-imbue-purple-dark !text-[1.3rem] lg:!text-3xl`}
          >
            Headline
          </p>
          <div className={`${styles.budgetInputContainer} !mt-[0.5rem]`}>
            <input
              autoComplete='off'
              className={styles.briefDetailFieldInput}
              style={{ paddingLeft: '24px', height: 'auto' }}
              type='text'
              value={headline || ''}
              onChange={handleChange}
              name='headline'
            />
            <span
              className={`text-xs ${'text-imbue-light-purple-two'} mt-[-10px]`}
            >
              {inputError?.headline}
            </span>
          </div>

          <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal !my-0 mx-0 !mb-3'>
            Skills
          </h1>

          <div className={`${styles.skillsContainer} !mt-0 !py-0 mb-6 `}>
            <SkillPanel />
            <div className='mt-4'>
              <span className={`text-xs ${'text-imbue-light-purple-two'} `}>
                {inputError?.skills}
              </span>
            </div>
          </div>

          <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal my-0 mx-0'>
            Industries
          </h1>
          <div className={`${styles.industryContainer} !mt-[0.5rem] !py-0 `}>
            <IndustryPannel />
            <div className='mt-4'>
              <span className={`text-xs ${'text-imbue-light-purple-two'} `}>
                {inputError?.industries}
              </span>
            </div>
          </div>

          <div>
            <p
              className={`${styles.fieldName} !text-imbue-purple-dark !text-[1.3rem] lg:!text-3xl mt-[1.5rem] mb-3`}
            >
              Maximum project budget (USD)
            </p>
            <div
              className={`${styles.budgetInputContainer} !mt-[0.5rem] !py-0 !mb-3`}
            >
              <input
                autoComplete='off'
                className={`${styles.briefDetailFieldInput}`}
                style={{
                  paddingLeft: '24px',
                  height: 'auto',
                }}
                type='number'
                min='0'
                max={1000000000}
                onWheel={(event: any) => { event.target.blur(); }}
                value={budget || ''}
                onChange={handleChange}
                name='budget'
              />
              <div className={styles.budgetCurrencyContainer}>$</div>
            </div>

            {inputError?.budget ? (
              <span className={`!text-imbue-purple text-xs`}>
                {inputError?.budget}
              </span>
            ) : (
              <div
                className={`${styles.budgetDescription} !text-imbue-purple !mb-0 !mt-0 text-xs`}
              >
                You will be able to set milestones which divide your project
                into manageable phases.
              </div>
            )}
          </div>
          <div className='mt-4'>
            {' '}
            <FormControlLabel
              control={
                <Checkbox
                  checked={verified_only}
                  onChange={(e) => setVerified_only(e.target.checked)}
                  defaultChecked
                  color='secondary'
                />
              }
              label='Only verified freelancers can apply to this brief'
              className='text-content-primary'
            />
          </div>
        </fieldset>

        <fieldset className='bg-white p-[1rem] lg:p-[2rem] rounded-[1.25rem]'>
          <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal my-0 mx-0'>
            Description
          </h1>
          <div className={styles.descriptionContainer}>
            <TextArea
              value={description}
              name='description'
              maxLength={5000}
              className='text-black bg-transparent'
              rows={10}
              onChange={handleChange}
            />
            <span
              className={`text-xs ${'text-imbue-light-purple-two'} mt-[-10px]`}
            >
              {inputError?.description}
            </span>
          </div>

          <SpacedRow>
            <div className={styles.scopeContainer}>
              <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal my-0 mx-0'>
                Scope
              </h1>
              {scopeData.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={scopeId === value}
                  onSelect={() => setScopeId(value)}
                  textclass='!text-imbue-purple-dark'
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal mt-[1.5rem] lg:my-0 mx-0 '>
                Experience
              </h1>

              {experiencedLevel.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={expId === value}
                  onSelect={() => setExpId(value)}
                  textclass='!text-imbue-purple-dark'
                />
              ))}
            </div>

            <div className={styles.scopeContainer}>
              <h1 className='!text-[1.3rem] lg:!text-3xl m-0 font-normal mt-[1.5rem] lg:my-0 mx-0'>
                Duration
              </h1>
              {timeData.map(({ label, value }, index) => (
                <Option
                  label={label}
                  value={value}
                  key={index}
                  checked={durationId === value}
                  onSelect={() => setDurationId(value)}
                  textclass='!text-imbue-purple-dark'
                />
              ))}
            </div>
          </SpacedRow>
        </fieldset>

        <fieldset>
          <div className='buttons-container mb-[2rem]'>
            <button
              disabled={loading || isinputError()}
              className='primary-btn in-dark w-button w-full !mr-0 hover:!bg-imbue-purple !text-[1rem] hover:!text-white h-[2.6rem]'
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
            onClick={() => router.replace(`/briefs/${briefId}/`)}
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
