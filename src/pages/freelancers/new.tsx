/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import * as utils from '@/utils';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';

import {
  freelancedBefore,
  freelancingGoal,
  // importInformation,
  stepData,
  suggestedLanguages,
  suggestedServices,
} from '@/config/freelancer-data';
import { getAllSkills } from '@/redux/services/briefService';
import { createFreelancingProfile } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

import { TagsInput } from '../../components/TagsInput';
import styles from '../../styles/modules/Freelancers/new-Freelancer.module.css';

const Freelancer = (): JSX.Element => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const displayName = user?.display_name;
  const [freelancingBefore, setFreelancingBefore] = useState<any>();
  const [goal, setGoal] = useState<any>();
  // const [resume, setResume] = useState<any>();
  const [title, setTitle] = useState<any>();
  const [education, setEducation] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState<any>();
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [suggestedFreelancingSkills, setSuggestedSkills] = useState<string[]>(
    []
  );

  useEffect(() => {
    fetchSuggestedSkills();
  }, []);

  const fetchSuggestedSkills = async () => {
    const skillsRes = await getAllSkills();
    if (skillsRes) {
      setSuggestedSkills(skillsRes?.skills.map((skill) => skill.name));
    }
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
      <div className={styles.contentTextSmallFlex}>
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

  const FreelancingGoal = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
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
  //     <div className={styles.contentTextSmallFlex}>
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
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <input
          className={`${styles.fieldInput} placeholder:text-imbue-light-purple`}
          placeholder='Enter your title'
          data-testid='title'
          name='title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );

  // const ExperiencePanel = (
  //   <div className={styles.freelanceXpContainer}>
  //     <div className={styles.contentTextSmallFlex}>
  //       {stepData[step].content.split('\n').map((line, index) => (
  //         <p key={index}>{line}</p>
  //       ))}
  //     </div>
  //   </div>
  // );

  const EducationPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className={styles.namePanelInputWrapper}>
        <input
          className={`${styles.fieldInput} placeholder:text-imbue-light-purple`}
          placeholder='Enter your education'
          name='education'
          data-testid='education'
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>
    </div>
  );

  const LanguagePanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className='mt-6 pb-20'>
        <TagsInput
          suggestData={suggestedLanguages}
          data-testid='languages'
          tags={languages}
          onChange={(tags: string[]) => setLanguages(tags)}
        />
      </div>
    </div>
  );

  const SkillsPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <h3 className='text-lg text-black mt-5'>Your Skills</h3>
      <div className='mt-5 mb-20'>
        <TagsInput
          suggestData={suggestedFreelancingSkills}
          tags={skills}
          onChange={(tags: string[]) => setSkills(tags)}
          hideInput
        />
      </div>
    </div>
  );

  const BioPanel = (
    <div className={styles.freelanceXpContainer}>
      <div className={styles.contentTextSmallFlex}>
        {stepData[step].content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <div className={styles.namePanelInputWrapper}>
        <textarea
          className={`${styles.fieldInput} ${styles.large}`}
          placeholder='Enter your bio'
          data-testid='bio'
          name='bio'
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
    if (step === 4 && !education) {
      return false;
    }
    // Freelancers might only speak 1 language
    // if (step === 5 && !languages.length) {
    //   return false;
    // }
    if (step === 6 && !skills.length) {
      return false;
    }
    if (step === 7 && !bio) {
      return false;
    }
    if (step === 8 && !services.length) {
      return false;
    }
    return true;
  };

  async function createProfile() {
    try {
      setLoading(true);
      const response: any = await createFreelancingProfile({
        id: 0,
        bio,
        education: education,
        experience: freelancingBefore,
        freelanced_before: freelancingBefore,
        freelancing_goal: goal,
        work_type: '',
        skills,
        title,
        languages,
        services,
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
      });

      if (response.status === 201) {
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
            <h2 data-testid='heading' className='text-theme-secondary'>
              {stepData[step].heading.replace('{name}', displayName)}
            </h2>
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
                className='primary-btn in-dark w-button mr-auto mt-6'
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
              <button
                className='primary-btn in-dark w-button'
                data-testid='submit-button'
                disabled={!validate()}
                onClick={() => createProfile()}
              >
                Submit
              </button>
            ) : (
              <button
                className='primary-btn in-dark w-button !mt-0'
                data-testid='next-button'
                disabled={!validate()}
                onClick={() => setStep(step + 1)}
              >
                Next
              </button>
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
