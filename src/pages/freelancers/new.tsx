/* eslint-disable react-hooks/exhaustive-deps */
import {
  Autocomplete,
  InputAdornment,
  OutlinedInput,
  TextField,
  Tooltip,
} from '@mui/material';
import Filter from 'bad-words';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as utils from '@/utils';
import { isUrlExist, validateInputLength } from '@/utils/helper';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import { AppContext, AppContextType } from '@/components/Layout';
import ValidatableInput from '@/components/ValidatableInput';

import {
  freelancedBefore,
  freelancingGoal,
  // importInformation,
  stepData,
  suggestedServices,
} from '@/config/freelancer-data';
import { fetchUserRedux } from '@/redux/reducers/userReducers';
import {
  searchLanguageByName,
  searchSkills,
} from '@/redux/services/briefService';
import { createFreelancingProfile } from '@/redux/services/freelancerService';
import { AppDispatch, RootState } from '@/redux/store/store';

import { TagsInput } from '../../components/TagsInput';
import styles from '../../styles/modules/Freelancers/new-Freelancer.module.css';

const Freelancer = (): JSX.Element => {
  const router = useRouter();
  const filter = new Filter({ placeHolder: ' ' });
  const [step, setStep] = useState(0);
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const displayName = user?.display_name;
  const [freelancingBefore, setFreelancingBefore] = useState<string>();
  const [goal, setGoal] = useState<any>();
  // const [resume, setResume] = useState<any>();
  const [title, setTitle] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [about, setAbout] = useState<any>();
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [suggestedFreelancingSkills, setSuggestedSkills] = useState<string[]>(
    []
  );
  const [suggestedLanguages, setSuggestedLanguages] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { setProfileMode } = useContext(AppContext) as AppContextType;

  useEffect(() => {
    if (!userLoading && (!user || !user?.id)) {
      router.push('/');
    } else if (!userLoading) setLoading(false);
  }, [userLoading, user]);

  useEffect(() => {
    fetchSuggestedSkills();
    fetchSuggestedLanguage();
  }, []);

  const fetchSuggestedSkills = async () => {
    const skillsRes = await searchSkills('');
    if (skillsRes) {
      setSuggestedSkills(skillsRes?.skills.map((skill) => skill.name));
    }
  };

  const fetchSuggestedLanguage = async () => {
    const languageRes = await searchLanguageByName('e');
    if (languageRes) {
      setSuggestedLanguages(
        languageRes?.languages.map((language) => language.name)
      );
    }
  };

  const searchLanguage = async (name: string) => {
    const languageRes = await searchLanguageByName(
      name.length > 0 ? name : 'e'
    );
    if (languageRes) {
      setSuggestedLanguages(
        languageRes?.languages.map((language) => language.name)
      );
    }
  };

  const searchSkill = async (name: string) => {
    const skillRes = await searchSkills(name);
    if (!skillRes || !skillRes?.skills.length) return;
    setSuggestedSkills(skillRes?.skills.map((skill) => skill.name));
  };

  const HelloPanel = (
    <div className={styles.helloPanel}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content
          .split('\n')
          .map((line: string, index: number) => (
            <p key={index}>{line}</p>
          ))}
      </div>
    </div>
  );

  const FreelanceExperience = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content
          .split('\n')
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
              freelancingBefore === value ? styles.active : ''
            }`}
            onClick={() => setFreelancingBefore(value)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  const [hourperrate, setHourPerrate] = useState<number | undefined>();

  const FreelancerHourPerRate = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <OutlinedInput
          id='outlined-adornment-amount'
          onChange={(event: any) =>
            setHourPerrate(
              event.target.value > 0
                ? Math.trunc(event.target.value)
                : undefined
            )
          }
          className='w-full'
          value={hourperrate}
          placeholder='0.00'
          type='number'
          color='secondary'
          startAdornment={<InputAdornment position='start'>$</InputAdornment>}
        />
      </div>
    </div>
  );

  const FreelancingGoal = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.freelanceXpOptions}>
        {freelancingGoal.map(({ label, value }, index) => (
          <div
            key={index}
            data-testid={`freelance-goal-${index}`}
            className={`${styles.freelanceXpItem} ${
              goal === value ? styles.active : ''
            }`}
            onClick={() => setGoal(value)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  // const ImportResume = (
  //   // TODO:
  //   <div className={styles.freelanceXpContainer}>
  //     <div className={styles.contentTextSmall}>
  //       {stepData[step].content.split('\n').map((line, index) => (
  //         <p key={index}>{line}</p>
  //       ))}
  //     </div>
  //     <div className={styles.freelanceXpOptions}>
  //       {importInformation.map(({ label, value }, index) => (
  //         <div
  //           key={index}
  //           className={`${styles.freelanceXpItem} ${
  //             resume === value ? styles.active : ''
  //           }`}
  //           onClick={() => setResume(value)}
  //         >
  //           {label}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  const TitlePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <ValidatableInput
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          name='title'
          testId='title-free'
          placeholder='Enter your title'
          value={title}
        />
      </div>
    </div>
  );

  // const ExperiencePanel = (
  //   <div className={styles.freelanceXpContainer}>
  //     <div className={styles.contentTextSmall}>
  //       {stepData[step].content.split('\n').map((line, index) => (
  //         <p key={index}>{line}</p>
  //       ))}
  //     </div>
  //   </div>
  // );

  const EducationPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <ValidatableInput
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEducation(e.target.value)
          }
          maxLength={100}
          className={`${styles.fieldInput} placeholder:text-imbue-light-purple`}
          placeholder='Enter your education'
          name='education'
          data-testid='education'
          value={education}
          minLength={10}
          type='text'
        />
      </div>
    </div>
  );

  const LanguagePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className='mt-6 pb-20'>
        <Autocomplete
          id='tags-standard'
          multiple
          getOptionLabel={(option) => option}
          options={suggestedLanguages}
          sx={{ width: '100%' }}
          onChange={(e, value) => setLanguages(value)}
          defaultValue={languages}
          ListboxProps={{ className: 'max-h-[280px]' }}
          renderInput={(params) => (
            <TextField
              data-testid='tag-input'
              autoComplete='off'
              color='secondary'
              onChange={(e) => searchLanguage(e.target.value)}
              {...params}
            />
          )}
        />
      </div>
    </div>
  );

  const SkillsPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <h3 className='text-lg text-black mt-5'>Your Skills</h3>
      <div className='mt-5 mb-20'>
        <Autocomplete
          id='tags-standard'
          multiple
          getOptionLabel={(option) => option}
          options={suggestedFreelancingSkills}
          sx={{ width: '100%' }}
          onChange={(e, value) => setSkills(value)}
          defaultValue={skills}
          ListboxProps={{ className: 'max-h-[260px]' }}
          renderInput={(params) => (
            <TextField
              autoComplete='off'
              color='secondary'
              onChange={(e) => searchSkill(e.target.value)}
              {...params}
            />
          )}
        />
        {!skills.length && (
          <p className='mt-2 text-imbue-coral text-sm capitalize-first'>
            Please add at least 1 skill
          </p>
        )}
      </div>
    </div>
  );

  const BioPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <div className={styles.namePanelInputWrapper}>
        <ValidatableInput
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAbout(e.target.value)
          }
          className={`${styles.fieldInput} ${styles.large}`}
          placeholder='Enter your bio'
          data-testid='bio'
          name='bio'
          maxLength={5000}
          minLength={50}
          rows={6}
          value={about}
        />
      </div>
    </div>
  );

  const ServicesPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmall}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className='mt-5 mb-20'>
        <TagsInput
          suggestData={suggestedServices}
          tags={services}
          onChange={(tags: string[]) => setServices(tags)}
        />
        {!services.length && (
          <p className='mt-4 text-imbue-coral text-sm capitalize-first'>
            Please add at least 1 service
          </p>
        )}
      </div>
    </div>
  );

  const ConfirmPanel = (
    <div className={styles.descriptionPanel}>
      <p className='mt-8 text-imbue-purple-dark'>
        Thank you for your submission!
      </p>
    </div>
  );

  const panels = [
    HelloPanel,
    FreelanceExperience,
    FreelancingGoal,
    // ImportResume,
    TitlePanel,
    EducationPanel,
    // ExperiencePanel,
    LanguagePanel,
    SkillsPanel,
    BioPanel,
    ServicesPanel,
    FreelancerHourPerRate,
    ConfirmPanel,
  ];

  useEffect(() => {
    setDisableSubmit(!validate());
  }, [
    freelancingBefore,
    goal,
    title,
    education,
    skills?.length,
    about,
    services?.length,
    step,
    hourperrate,
  ]);

  const validate = (): boolean => {
    // TODO: show notification
    if (step === 1 && !freelancingBefore) {
      return false;
    } else if (step === 2 && !goal) {
      return false;
    } else if (
      step === 3 &&
      (!title || isUrlExist(title) || !validateInputLength(title, 10, 50))
    ) {
      // TODO: minimum required length for description
      return false;
    } else if (
      step === 4 &&
      (!education ||
        isUrlExist(education) ||
        !validateInputLength(education, 10, 100))
    ) {
      return false;
    }
    // Freelancers might only speak 1 language
    // if (step === 5 && !languages.length) {
    //   return false;
    // }
    else if (step === 6 && !skills.length) {
      return false;
    } else if (
      step === 7 &&
      (!about || !validateInputLength(about, 50, 5000))
    ) {
      return false;
    } else if (step === 8 && !services.length) {
      return false;
    } else if (step === 9 && (hourperrate === 0 || hourperrate === undefined))
      return false;
    return true;
  };

  async function createProfile() {
    try {
      setLoading(true);

      const freelancerData = {
        id: 0,
        about: filter.clean(about).trim(),
        education: filter.clean(education).trim(),
        experience: freelancingBefore,
        freelanced_before: freelancingBefore,
        freelancing_goal: goal,
        work_type: '',
        skills: skills.map((item) =>
          item.trim().length ? filter.clean(item).trim() : ''
        ),
        title: filter.clean(title).trim(),
        languages: languages.map((item) =>
          item.trim().length ? filter.clean(item).trim() : ''
        ),
        services: services.map((item) =>
          item.trim().length ? filter.clean(item).trim() : ''
        ),
        hour_per_rate: hourperrate || 0,
        user_id: user?.id,
        username: user?.display_name,
        display_name: user?.display_name,
        discord_link: null,
        facebook_link: null,
        telegram_link: null,
        twitter_link: null,
        clients: [],
        client_images: [],
        num_ratings: 0,
        profileImageUrl: require('@/assets/images/profile-image.png'),
      };

      const response: any = await createFreelancingProfile(freelancerData);

      if (response.status === 201) {
        dispatch(fetchUserRedux());
        setProfileMode('freelancer');
        setStep(step + 1);
      } else {
        setError({
          message: `Could not update freelancer Profile ${response.status} (${response.statusText})`,
        });
      }
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false);
    }
  }

  if (loading || userLoading) return <FullScreenLoader />;

  return (
    <div className={styles.freelancerDetailsContainer}>
      <div className={styles.mainPanel}>
        <div className='h-full w-full flex flex-col justify-between'>
          <div className={styles.freelancerContents}>
            <p data-testid='heading' className='text-2xl lg:text-4xl text-[#282D34]'>
              {stepData[step].heading.replace('{name}', displayName)}
            </p>
            {panels[step] ?? <></>}
          </div>
          <div className={step === 0 ? styles.buttonLeft : styles.buttonRight}>
            {step >= 1 && (
              <button
                className='secondary-btn !mt-0 !border !border-imbue-purple hover:!border-primary'
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}

            {step === 0 ? (
              <button
                className='primary-btn in-dark w-button mr-auto mt-8'
                onClick={() => setStep(1)}
                data-testid='get-started-button'
              >
                Get Started!
              </button>
            ) : step === stepData.length - 1 ? (
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
                  className={`primary-btn in-dark w-button !mt-0 ${
                    disableSubmit &&
                    '!bg-gray-400 !text-white !cursor-not-allowed'
                  }`}
                  data-testid='submit-button'
                  onClick={() => !disableSubmit && createProfile()}
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
                  className={`primary-btn in-dark w-button !mt-0 ${
                    disableSubmit &&
                    '!bg-gray-400 !text-white !cursor-not-allowed'
                  }`}
                  data-testid='next-button'
                  onClick={() => !disableSubmit && setStep(step + 1)}
                >
                  Next
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* {
          step===0 && (
            <div className='h-full bg-imbue-light-purple px-8 py-14 w-2/5 rounded-xl ml-10'>
              <Image 
              height={180} 
              width={180} 
              src={require('@/assets/images/Freelancer.png')} 
              alt=''
              className='m-auto w-full object-cover'
              />
              <p className='text-imbue-purple mt-8'>Expert Backend Developer, Greece. Over 20 projects successfully completed on Imbue Enterprise to date.</p>
              <p className='text-imbue-purple mt-8 text-2xl'>Suzie John</p>
            </div>
          )
        } */}
      </div>
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

export default Freelancer;
