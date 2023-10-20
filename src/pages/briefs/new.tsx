import { Autocomplete, Checkbox, FormControlLabel, TextField, Tooltip } from '@mui/material';
import Filter from 'bad-words';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import * as utils from '@/utils';
import { getServerSideProps } from '@/utils/serverSideProps';

import { TextArea } from '@/components/Briefs/TextArea';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import { Option } from '@/components/Option';
import { ProgressBar } from '@/components/ProgressBar';
import ValidatableInput from '@/components/ValidatableInput';

import * as config from '@/config';
import {
  experiencedLevel,
  nameExamples,
  scopeData,
  stepData,
  timeData,
} from '@/config/briefs-data';
import { searchIndustries, searchSkills } from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';

import styles from '../../styles/modules/newBrief.module.css';

const NewBrief = (): JSX.Element => {
  const filter = new Filter();
  const [step, setStep] = useState(0);
  const [headline, setHeadline] = useState<string>("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [verified_only, setVerified_only] = useState<boolean>(true);
  const [expId, setExpId] = useState<number>();
  const [scopeId, setScopeId] = useState<number>();
  const [durationId, setDurationId] = useState<number>();
  const [budget, setBudget] = useState<number>(0);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [suggestedIndustries, setSuggestedIndustries] = useState<string[]>([]);

  const [error, setError] = useState<any>();
  const [inputError, setInputError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [industriesError, setIndustriesError] = useState(false);
  const [skillError, setSkillError] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.userState);

  useEffect(() => {
    fetchSuggestedSkills();
    fetchSuggestedIndustries();
  }, []);

  const fetchSuggestedSkills = async () => {
    const skillsRes = await searchSkills('');
    if (skillsRes) {
      setSuggestedSkills(skillsRes?.skills.map((skill) => skill.name));
    }
  };

  const fetchSuggestedIndustries = async () => {
    const industriesRes = await searchIndustries('a');
    if (industriesRes) {
      setSuggestedIndustries(
        industriesRes?.industry.map((industries) => industries.name)
      );
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
    if (val.length < 1 || val.length > 5) setIndustriesError(true);
    else setIndustriesError(false);
    setIndustries(val);
  };

  const handleSkillsChange = (val: string[]) => {
    if (val.length < 3 || val.length > 10) setSkillError(true);
    else setSkillError(false);
    setSkills(val);
  };

  const validateInputLength = (
    text: string,
    min: number,
    max: number
  ): boolean => {
    return text?.length >= min && text.length <= max;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setInputError('');

    switch (name) {
      case 'headline':
        if (validateInputLength(value, 10, 50)) {
          setHeadline(value);
          setInputError('');
        } else {
          setHeadline(value);
          setInputError('Headline must be between 10 and 50 characters');
        }
        break;
      case 'description':
        if (validateInputLength(value, 50, 5000)) {
          setDescription(value);
          setInputError('');
        } else {
          setInputError('Description must be between 50 and 5000 characters');
          setDescription(value);
        }
        break;
      default:
        break;
    }
  };

  const NamePanel = (
    <>
      <p className={styles.fieldName}>Write a headline for your brief</p>
      <div className={styles.namePanelInputWrapper}>
        <ValidatableInput
          data-testid='headline-input'
          name='headline'
          value={headline}
          onChange={(e: any) => setHeadline(e.target.value)}
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
        {/* <TagsInput
          suggestData={suggestedIndustries}
          data-testid='industries-input'
          tags={industries}
          onChange={(tags: string[]) => handleIndustriesChange(tags)}
          limit={10}
        /> */}
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
          ListboxProps={{ className: "max-h-[250px]" }}
          renderInput={(params) => (
            <TextField
              color='secondary'
              autoComplete='off'
              onChange={(e) => searchIndustry(e.target.value)}
              {...params}
            />
          )}
        />
      </div>
      <div className='flex flex-wrap flex-row  justify-center relative -top-4'>
        <span className={!industriesError ? 'hide' : 'error'}>
          number of industries must be between 1 to 5
        </span>
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
          data-testid='description-input'
          value={description}
          name='description'
          maxLength={5000}
          className='text-black bg-white outline-none'
          onChange={handleChange}
        />
        <div className='flex flex-wrap flex-row justify-center relative top-4'>
          <span className={!inputError ? 'hide' : 'error'}>{inputError}</span>
        </div>
      </div>
    </div>
  );

  const SkillsPanel = (
    <>
      <p className={styles.fieldName}>Search the skills</p>
      <div className={styles.skillsContainer}>
        <Autocomplete
          id='tags-standard'
          data-testid='skills-input'
          multiple
          getOptionLabel={(option) => option}
          options={suggestedSkills}
          sx={{ width: '100%' }}
          onChange={(e, value) => handleSkillsChange(value)}
          defaultValue={skills}
          ListboxProps={{ className: "max-h-[250px]" }}
          renderInput={(params) => (
            <TextField
              color='secondary'
              autoComplete='off'
              onChange={(e) => searchSkill(e.target.value)}
              {...params}
            />
          )}
        />
        <FormControlLabel control={
          <Checkbox
            checked={verified_only}
            onChange={(e) => setVerified_only(e.target.checked)}
            defaultChecked color='secondary'
          />
        }
          label="Only verified freelancers can apply to this brief"
          className='text-content-primary'
        />
      </div>
      <div className='flex flex-wrap flex-row  justify-center relative -top-8'>
        <span className={!skillError ? 'hide' : 'error'}>
          number of skills must be between 3 to 10
        </span>
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
            <div
              className={`${styles.scopeItemDescription} font-Aeonik mt-[0.75rem]`}
            >
              {description}
            </div>
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

  const preventChange = (e:any) =>{
        e.target.blur()
  }

  const BudgetPanel = (
    <div className='mb-auto'>
      <p className={styles.fieldName}>Maximum project budget (USD)</p>
      <div className={styles.budgetInputContainer}>
        <input
          className={styles.briefDetailFieldInput}
          style={{ paddingLeft: '24px', height: 'auto' }}
          type='number'
          min='0'
          data-testid='budget-input'
          value={budget || ''}
          max={1000000000}
          onWheel={preventChange}
          onChange={(e) => {
            if (
              Number(e.target.value) < 0 ||
              Number(e.target.value) > 1000000000
            ) {
              e.preventDefault();
            } 
           
            else {
              setBudget(Number(e.target.value));
            }
          }}
        />
        <div className={styles.budgetCurrencyContainer}>$</div>
      </div>
      <div className={styles.budgetDescription + ' !my-2'}>
        You will be able to set milestones which divide your project into
        manageable phases.
      </div>
      {Number(budget) < 10 && (
        <div className={`${styles.budgetDescription} !my-5 !text-red-600`}>
          We recommend a minimum budget of $10 for a brief.
        </div>
      )}
      {!Number.isInteger(Number(budget)) && 
        <div className={`${styles.budgetDescription} !my-5 !text-red-600`}>
        Please use rounded numbers
       </div>}
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
    if (step === 0 && !validateInputLength(headline, 10, 50)) {
      return false;
    }
    if (
      step === 1 &&
      (!industries.length || industries.length < 1 || industries.length > 5)
    ) {
      return false;
    }
    if (step === 2 && !validateInputLength(description, 50, 5000)) {
      // TODO: minimum required length for description
      return false;
    }
    if (
      step === 3 &&
      (!skills.length || skills.length < 3 || skills.length > 10)
    ) {
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
    if (step === 7 && (!budget || Number(budget) < 10 || !Number.isInteger(Number(budget)))) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    setDisableSubmit(!validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    headline,
    industries.length,
    description,
    skills.length,
    expId,
    scopeId,
    durationId,
    budget,
    step,
  ]);

  const onReviewPost = async () => {
    //TODO: implement api call
    setLoading(true);
    try {
      if (filter.isProfane(headline)) {
        throw new Error('remove bad word from the title');
      }
      const user_id = user?.id;
      const resp = await fetch(`${config.apiBase}/briefs/`, {
        headers: config.postAPIHeaders,
        method: 'post',
        body: JSON.stringify({
          headline: filter.clean(headline.trim()),
          industries: industries.map((item) => filter.clean(item)),
          description: filter.clean(description.trim()),
          scope_id: scopeId,
          experience_id: expId,
          duration_id: durationId,
          skills,
          budget,
          user_id,
          verified_only
        }),
      });
      if (resp.status === 200 || resp.status === 201) {
        setStep(step + 1);
      } else {
        setError({ message: 'Failed to submit the brief' });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='h-[90%] flex lg:mt-[1.5rem] rounded-[1.25rem]'>
      <div className={`${styles.newBriefContainer} hq-layout`}>
        <div className={styles.leftPanel}>
          <ProgressBar
            titleArray={['Description', 'Skills', 'Scope', 'Budget']}
            currentValue={stepData[step].progress}
          />
          <h1 className={styles.heading}>{stepData[step].heading}</h1>
          {stepData[step].content.split('\n').map((content, index) => (
            <p
              className={styles.help}
              style={{ marginTop: index === 1 ? '1rem' : '0px' }}
              key={index}
            >
              {content}
            </p>
          ))}
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.contents}>{panels[step] ?? <></>} </div>
          <div className={styles.buttons}>
            {step >= 1 && (
              <button
                className='secondary-btn !mt-0 !border !border-imbue-purple-dark hover:!bg-white'
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}

            {step === stepData.length - 1 ? (
              <button
                className='primary-btn in-dark w-button'
                onClick={() => utils.redirect('briefs')}
              >
                Discover Briefs
              </button>
            ) : step === stepData.length - 2 ? (
              <Tooltip
                followCursor
                leaveTouchDelay={10}
                title={
                  disableSubmit && 'Please fill all the required input fields'
                }
              >
                <button
                  className={`primary-btn in-dark w-button !mt-0 ${disableSubmit &&
                    '!bg-gray-400 !text-white !cursor-not-allowed'
                    }`}
                  data-testid='submit-button'
                  onClick={() => !disableSubmit && onReviewPost()}
                >
                  Submit
                </button>
              </Tooltip>
            ) : (
              <Tooltip
                followCursor
                leaveTouchDelay={10}
                title={
                  disableSubmit && 'Please fill all the required input fields'
                }
              >
                <button
                  className={`primary-btn in-dark w-button !mt-0 ${disableSubmit &&
                    '!bg-gray-400 !text-white !cursor-not-allowed'
                    }`}
                  data-testid='next-button'
                  disabled={disableSubmit}
                  onClick={() => !disableSubmit && setStep(step + 1)}
                // onClick={() => console.log("hit")}
                >
                  {stepData[step].next
                    ? `Next: ${stepData[step].next}`
                    : 'Next'}
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      {loading && <FullScreenLoader />}
      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/briefs`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Discover Briefs
          </button>
          <button
            onClick={() => setError(null)}
            className='underline text-xs lg:text-base font-bold'
          >
            Try Again
          </button>
        </div>
      </ErrorScreen>
    </div>
  );
};

export { getServerSideProps };

export default NewBrief;
