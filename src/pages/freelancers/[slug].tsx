/* eslint-disable react-hooks/exhaustive-deps */
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  Alert,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/system';
import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { AiOutlineUser } from 'react-icons/ai';
import {
  FaDiscord,
  FaFacebook,
  FaRegShareSquare,
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaStar,
  FaTelegram,
  FaTwitter,
} from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { GrCertificate } from 'react-icons/gr';
import { ImStack } from 'react-icons/im';
import { IoPeople } from 'react-icons/io5';
import { MdOutlineWatchLater } from 'react-icons/md';
import { useSelector } from 'react-redux';

import AccountChoice from '@/components/AccountChoice';
import { TextArea } from '@/components/Briefs/TextArea';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import Clients from '@/components/Profile/Clients';
import CountrySelector from '@/components/Profile/CountrySelector';
import Skills from '@/components/Profile/Skills';
import UploadImage from '@/components/Profile/UploadImage';
import SuccessScreen from '@/components/SuccessScreen';

import FiverrIcon from '@/assets/images/fiverr.png';
import ImbueIcon from '@/assets/svgs/loader.svg';
import { Freelancer, User } from '@/model';
import {
  getFreelancerProfile,
  updateFreelancer,
} from '@/redux/services/freelancerService';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';
import { RootState } from '@/redux/store/store';
import styles from '@/styles/modules/freelancers.module.css';

import { checkEnvironment, fetchUser } from '../../utils';

export type ProfileProps = {
  initFreelancer: Freelancer;
};

const Profile = ({ initFreelancer }: ProfileProps): JSX.Element => {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<any>(initFreelancer);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  const [skills, setSkills] = useState<string[]>(
    freelancer?.skills?.map(
      (skill: { id: number; name: string }) =>
        skill?.name?.charAt(0).toUpperCase() + skill?.name?.slice(1)
    )
  );

  const { user: browsingUser } = useSelector(
    (state: RootState) => state.userState
  );

  const isCurrentFreelancer =
    browsingUser && browsingUser?.id === freelancer?.user_id;

  const [openAccountChoice, setOpenAccountChoice] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  function urlify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (!urlRegex.test(text)) {
      const finalUrl = new URL(`https://${text}`);
      return finalUrl.href;
    }
    return text;
  }

  useEffect(() => {
    const setup = async () => {
      if (freelancer) {
        setTargetUser(await fetchUser(freelancer?.user_id));
      }
    };
    setup();
  }, [freelancer]);

  //The fields must be pre populated correctly.
  const onSave = async () => {
    try {
      if (freelancer) {
        setLoading(true);
        let data = freelancer;
        data = {
          ...data,
          skills: skills,
          clients: [],
        };

        await updateFreelancer(data);
        setSuccess(true);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageBoxClick = () => {
    if (browsingUser) {
      setShowMessageBox(true);
    }
  };

  const flipEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const handleUpdateState = (e: any) => {
    const newFreelancer = {
      ...freelancer,
      [e?.target?.name]: e?.target?.value,
    };
    setFreelancer(newFreelancer);
  };

  const cancelEdit = async () => {
    setFreelancer(initFreelancer);
    setIsEditMode(false);
    setClients(clinetsData);
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge as string,
        account
      );
      if (resp.ok) {
        setFreelancer({
          ...freelancer,
          web3_address: account.address,
          web3_type: account.source,
        });
      }
    } catch (error) {
      setError(error);
    }
  };

  const socials = [
    {
      label: 'Facebook',
      key: 'facebook_link',
      // value: freelancer?.facebook_link,
      value: 'facebook.com',
      icon: (
        <FaFacebook
          color='#4267B2'
          onClick={() =>
            freelancer?.facebook_link &&
            window.open(urlify(freelancer?.facebook_link), '_blank')
          }
        />
      ),
    },
    {
      label: 'Twitter',
      key: 'twitter_link',
      // value: freelancer?.twitter_link,
      value: 'twitter.com',
      icon: (
        <FaTwitter
          color='#1DA1F2'
          onClick={() =>
            freelancer?.twitter_link &&
            window.open(urlify(freelancer?.twitter_link), '_blank')
          }
        />
      ),
    },
    {
      label: 'Telegram',
      key: 'telegram_link',
      value: freelancer?.telegram_link,
      icon: (
        <FaTelegram
          onClick={() =>
            freelancer?.telegram_link &&
            window.open(urlify(freelancer?.telegram_link), '_blank')
          }
        />
      ),
    },
    {
      label: 'Discord',
      key: 'discord_link',
      value: freelancer?.discord_link,
      icon: (
        <FaDiscord
          onClick={() =>
            freelancer?.discord_link &&
            window.open(urlify(freelancer?.discord_link), '_blank')
          }
        />
      ),
    },
  ];

  const work = {
    title: 'Product Development Engineer',
    ratings: 3,
    time: 'Jan 19, 2023 - Jan 20, 2023',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed rhoncus elit nec imperdiet mollis. Donec et pharetra magna. Fusce sed urna vestibulum, pretium turpis eu, ultricies urna. Donec faucibus, justo sed pretium commodo, felis sapien malesuada mauris, a finibus orci dolor non ante. Morbi aliquam tortor in massa efficitur pulvinar. Ut interdum tempor aliquet. Duis eget dignissim nunc. Ut non ligula nec lectus cursus tincidunt eget nec mauris',
    budget: 23000,
    budgetType: 'Fixed Price',
  };

  const [sortReviews, setSortReviews] = useState<any>('relevant');
  const reviews = [
    {
      name: 'Sam',
      ratings: 3,
      time: '1 month',
      description:
        'I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more',
      countryCode: 'US',
      country: 'United States',
      image:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Sausan',
      ratings: 3,
      time: '1 month',
      description:
        'I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more',
      countryCode: 'NO',
      country: 'Norway',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Aala S.',
      ratings: 3,
      time: '1 month',
      description:
        'I have contacted idris muhammad for building web3 for new eBook product that i am developing for my coaching business',
      countryCode: 'CA',
      country: 'Canada',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    },
  ];

  const clinetsData = [
    { id: 1, name: 'Fiverr', logo: FiverrIcon, website: 'fiverr.com' },
    { id: 2, name: 'Imbue', logo: ImbueIcon, website: 'fiverr.com' },
  ];

  const [clients, setClients] = useState<any>(clinetsData);

  const copyProfile = () => {
    const webSiteURL = checkEnvironment().concat(`${router.asPath}`);
    navigator.clipboard.writeText(webSiteURL);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className='profile-container lg:-mt-8 overflow-x-hidden relative'>
      <div className='banner'>
        <Image
          src={require('@/assets/images/profile-banner.png')}
          priority
          alt='profile banner'
          className='banner-image w-full object-cover h-[242px]'
        />
      </div>

      <div className='flex flex-col lg:flex-row justify-evenly lg:mx-[40px] px-[30px] lg:px-[40px]'>
        <div className='flex flex-col lg:items-center gap-[20px] lg:gap-[70px] lg:w-[40%]'>
          <div className='w-full flex flex-col items-center gap-[16px] pb-[30px] bg-theme-grey-dark rounded-xl border border-light-white'>
            <UploadImage
              isEditMode={isEditMode}
              user={freelancer}
              setUser={setFreelancer}
            />
            <div className='w-full flex flex-col gap-[16px] -mt-11 px-[30px] lg:px-[40px]'>
              {isEditMode ? (
                <TextField
                  onChange={(e) => handleUpdateState(e)}
                  id='outlined-basic'
                  name='display_name'
                  label='Name'
                  variant='outlined'
                  defaultValue={freelancer?.display_name}
                />
              ) : (
                <div className='flex gap-2 items-center justify-center mt-10'>
                  <h3 className='!text-2xl font-bold text-center z-[1]'>
                    {freelancer?.display_name}
                  </h3>
                  {initFreelancer?.verified && <VerifiedIcon color='primary' />}
                </div>
              )}

              <div className='flex gap-[15px] items-center justify-center flex-wrap'>
                {isEditMode ? (
                  <TextField
                    onChange={(e) => handleUpdateState(e)}
                    className='w-full'
                    id='outlined-basic'
                    name='username'
                    label='Username'
                    variant='outlined'
                    defaultValue={freelancer?.username}
                  />
                ) : (
                  <p className='text-[16px] leading-[1.2] text-primary max-w-full break-words text-center'>
                    @{freelancer?.username}
                  </p>
                )}

                <div className='flex items-center gap-2 w-full justify-center'>
                  {isEditMode ? (
                    <TextField
                      onChange={(e) => handleUpdateState(e)}
                      className='w-full'
                      id='outlined-basic'
                      name='title'
                      label='Tittle'
                      variant='outlined'
                      defaultValue={freelancer?.title}
                    />
                  ) : (
                    <>
                      <IoPeople color='var(--theme-secondary)' size='24px' />
                      <p className='text-[16px] leading-[1.2] text-[#ebeae2]'>
                        {freelancer?.title}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <CountrySelector
                isEditMode={isEditMode}
                user={freelancer}
                setUser={setFreelancer}
              />

              {/* TODO: Implement reviews */}

              <div className='rating flex justify-center gap-3'>
                <p className='mb-3'>
                  <FaStar color='var(--theme-primary)' />
                  <FaStar color='var(--theme-primary)' />
                  <FaStar color='var(--theme-primary)' />
                  <FaStar color='white' />
                </p>
                <p>
                  <span>Top Rated</span>
                  <span className='review-count ml-1'>(1434 reviews)</span>
                </p>
              </div>

              <div className='connect-buttons'>
                {/* {!isCurrentFreelancer && (
                  <>
                    <button
                      onClick={() => handleMessageBoxClick()}
                      className=' message'
                    >
                      Message
                    </button>
                  </>
                )}
                */}

                {isCurrentFreelancer ? (
                  <>
                    {isEditMode ? (
                      <div className='flex items-center justify-center gap-6 mb-5'>
                        <button onClick={() => onSave()} className='message'>
                          Save Changes <FiEdit />
                        </button>
                        <button
                          onClick={() => cancelEdit()}
                          className='message !bg-red-600'
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center gap-6 mb-5'>
                        <button onClick={() => flipEdit()} className='message'>
                          Edit Profile <FiEdit />
                        </button>
                        <button onClick={copyProfile} className='share'>
                          <FaRegShareSquare color='white' />
                          Share Profile
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className='flex items-center justify-center gap-6 mb-5'>
                    <button
                      onClick={() => handleMessageBoxClick()}
                      className=' message'
                    >
                      Message
                    </button>
                    <button onClick={copyProfile} className='share'>
                      <FaRegShareSquare color='white' />
                      Share Profile
                    </button>
                  </div>
                )}

                {/***
                  (<div>
                      <button
                        onClick={() => handleMessageBoxClick()}
                        className=' message'
                      >
                        Message
                      </button>
                    </div>) ? (
                      <button onClick={() => flipEdit()} className='message'>
                        Edit Profile <FiEdit />
                      </button>
                    ) : (
                      <button onClick={() => onSave()} className='message'>
                        Save Changes <FiEdit />
                      </button>
                    )
                 */}
                {/* 
                {!isEditMode && isCurrentFreelancer ? (
                  <button onClick={copyProfile} className='share'>
                    <FaRegShareSquare color='white' />
                    Share Profile
                  </button>
                ) : (
                  <button
                    onClick={() => cancelEdit()}
                    className='message !bg-red-600'
                  >
                    Cancel
                  </button>
                )} */}
              </div>
              {/* TODO: Implement */}
              {/* <div className="divider"></div>
                        <div className="show-more">
                            Show more{"  "}
                            <MdKeyboardArrowDown size="20" />
                        </div> */}
            </div>
            <hr className='separator' />

            <div className='flex items-center gap-3'>
              <p className='text-xl'>Among my clients</p>
              <span className='h-4 w-4 flex justify-center items-center rounded-full bg-gray-500 text-black'>
                ?
              </span>
            </div>

            <Clients
              {...{
                setFreelancer,
                isEditMode,
                setIsEditMode,
                clients,
                setClients,
              }}
            />

            <hr className='separator' />
            <div className='w-full px-[30px] lg:px-[40px]'>
              <p className='text-xl'>Wallet Address</p>
              <div className='mt-3 border break-words p-3 rounded-md bg-black'>
                {freelancer?.web3_address}
              </div>
            </div>

            {isEditMode && (
              <button
                onClick={() => setOpenAccountChoice(true)}
                className='primary-btn in-dark w-2/3'
              >
                Connect wallet
              </button>
            )}

            <AccountChoice
              accountSelected={(account: WalletAccount) =>
                accountSelected(account)
              }
              visible={openAccountChoice}
              setVisible={setOpenAccountChoice}
            />

            <hr className='separator' />

            <div className='w-full px-[30px] lg:px-[40px]'>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <AiOutlineUser size={24} />
                  <p className='text-light-grey'>Member Since</p>
                </div>
                <div>Jan 2023</div>
              </div>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <MdOutlineWatchLater size={24} />
                  <p className='text-light-grey'>Last project Delivery</p>
                </div>
                <div>2 hour</div>
              </div>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <ImStack size={24} />
                  <p className='text-light-grey'>Number of projects</p>
                </div>
                <div>58</div>
              </div>
            </div>
          </div>

          <div className='flex w-full'>
            <div className='flex flex-col gap-[36px] grow shrink-0 basis-[40%]'>
              <div className={`${styles.freelancerProfileSection} py-[30px]`}>
                <div className='mx-[30px] lg:mx-[40px]'>
                  <h5>Linked Account</h5>
                  <div className='flex flex-col gap-[16px] mt-[24px]'>
                    {socials?.map(({ label, key, value, icon }, index) => (
                      <div
                        className='h-auto flex flex-wrap justify-between items-center'
                        key={index}
                      >
                        <p className='text-base'>{label} </p>
                        {isEditMode ? (
                          <div
                            className='h-auto w-full lg:w-2/3 flex justify-between items-center'
                            key={index}
                          >
                            <TextArea
                              value={freelancer && freelancer[key]}
                              onChange={(e) => {
                                if (freelancer) {
                                  setFreelancer({
                                    ...freelancer,
                                    [key]: e.target.value,
                                  });
                                }
                              }}
                              //   className="bio-input"
                              className='bio-inpu bg-[#1a1a19] text-white border border-light-white'
                              id='bio-input-id'
                            />
                          </div>
                        ) : (
                          <button className='bg-[#262626] w-[32px] h-[32px] rounded-[10px] text-[#ebeae2] border-none text-[20px] font-semibold items-center justify-center'>
                            {socials && value ? icon : '+'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <hr className='separator' />

                <Skills
                  {...{
                    isEditMode,
                    setFreelancer,
                    freelancer,
                    skills,
                    setSkills,
                  }}
                />

                <hr className='separator' />
                {/* TODO: Implement */}
                <div className='ml-[30px] lg:mx-[40px]'>
                  <div className='header-editable'>
                    <h5>Certification</h5>
                    <div className='flex gap-3 mt-4'>
                      <div className='bg-theme-secondary h-11 w-11 rounded-full flex justify-center items-center'>
                        <GrCertificate className={styles.whiteIcon} size={24} />
                      </div>
                      <div>
                        <p className='text-light-grey'>
                          Web3 Certification of participation
                        </p>
                        <p className='text-light-grey'>Jan 14</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="section portfolio-breakdown">
                            <div className="subsection">
                                <h5>Portfolio Breakdown</h5>
                            </div>
                            <div className="divider" />
                            <div className="subsection">
                                {portfolio?.map(
                                    ({ category, rate }, index) => (
                                        <div
                                            className="breakdown-item"
                                            key={index}
                                        >
                                            <p className="category">
                                                {category}
                                            </p>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-indicator"
                                                    style={{
                                                        width: `${rate}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="rate">{rate}%</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div> 
                        {/* <div className="section activities">
                            <div className="subsection">
                                <h5>Account Activities</h5>
                            </div>
                            <div className="divider" />
                            <div className="activity-list">
                                <div className="activity-record">
                                    <p>Trusted Device Management</p>
                                    <button className="primary-button">
                                        Management
                                    </button>
                                </div>
                            </div>
                        </div> */}
            </div>
            {/* <div className="projects">
                        {this.state.projects?.map(
                            (
                                {
                                    image,
                                    milestoneComplete,
                                    milestoneCount,
                                    percent,
                                    title,
                                },
                                index
                            ) => (
                                <div className="project" key={index}>
                                    <div className="project-image-container">
                                        <img
                                            src="/public/project.png"
                                            width="100%"
                                            height="100%"
                                        />
                                        <div className="dark-layer" />
                                    </div>
                                    <div className="project-info">
                                        <h5>{title}</h5>
                                        <div className="project-progress">
                                            <div
                                                className="project-progress-indicator"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="milestone-progress">
                                            <p>{percent}%</p>
                                            <p>{`Milestone ${milestoneComplete ?? 0
                                                }/${milestoneCount}`}</p>
                                        </div>
                                    </div>
                                    <button className="primary-button full-width">
                                        Read More
                                    </button>
                                </div>
                            )
                        )}
                    </div> */}
          </div>

          <div
            className={`${styles.freelancerProfileSection} w-full py-[30px] px-[30px] lg:px-[40px]`}
          >
            <div className='header-editable'>
              <h5>About</h5>
            </div>
            {isEditMode ? (
              <>
                <TextArea
                  maxLength={1000}
                  value={freelancer?.bio}
                  onChange={(e) => {
                    if (freelancer) {
                      setFreelancer({
                        ...freelancer,
                        bio: e.target.value,
                      });
                    }
                  }}
                  rows={8}
                  className='bio-inpu px-4 py-2 bg-[#1a1a19] text-white border border-light-white'
                  id='bio-input-id'
                />
              </>
            ) : (
              <>
                <div className='bio'>
                  {freelancer?.bio
                    ?.split?.('\n')
                    ?.map?.((line: any, index: number) => (
                      <p className='leading-[1.2] text-base' key={index}>
                        {line}
                      </p>
                    ))}
                </div>
              </>
            )}
            <hr className='separator' />

            <div className='header-editable'>
              <h5>Education</h5>
            </div>
            {isEditMode ? (
              <>
                <TextArea
                  maxLength={1000}
                  value={freelancer?.education}
                  onChange={(e) => {
                    if (freelancer) {
                      setFreelancer({
                        ...freelancer,
                        education: e.target.value,
                      });
                    }
                  }}
                  rows={8}
                  className='bio-inpu px-4 py-2 bg-[#1a1a19] text-white border border-light-white'
                  id='bio-input-id'
                />
              </>
            ) : (
              <>
                <div className='bio'>
                  {/* TODO: Implementation */}
                  {/* {freelancer?.education
                  ?.split?.("\n")
                  ?.map?.((line: any, index: number) => (
                    <p className="leading-[1.2] text-base" key={index}>
                      {line}
                    </p>
                  ))} */}
                  {freelancer?.education || 'No Education Data Found'}
                </div>
              </>
            )}
          </div>
        </div>

        <div className='lg:w-[50%] mt-[20px] lg:mt-0'>
          <div className='bg-theme-grey-dark rounded-xl border border-light-white'>
            <div className='px-[30px] lg:px-[40px] py-[30px] border-b border-b-light-white'>
              <h3 className='mb-3'>Work History</h3>
              <p className='text-primary'>Completed Projects (3)</p>
            </div>
            <div>
              {[...Array(3)].map((v, i) => (
                <div
                  key={i}
                  className='px-[30px] lg:px-[40px] py-[30px] flex flex-col gap-3 border-b last:border-b-0 border-b-light-white'
                >
                  <p className='text-xl'>{work.title}</p>
                  <div className='flex gap-3 lg:gap-8 flex-wrap items-center justify-between'>
                    <div className='flex'>
                      {[...Array(4)].map((r, ri) => (
                        <FaStar
                          className='lg:h-[24px] lg:w-[24px]'
                          key={ri}
                          color={
                            ri + 1 > work.ratings
                              ? 'white'
                              : 'var(--theme-primary)'
                          }
                        />
                      ))}
                    </div>
                    <p className='text-light-grey'>{work.time}</p>
                  </div>
                  <p className='text-light-grey'>{work.description}</p>
                  <div className='flex justify-between'>
                    <p className=''>${work.budget}</p>
                    <p className=''>{work.budgetType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className='text-primary text-right m-2 cursor-pointer'>
            View More
          </p>

          <StyledEngineProvider injectFirst>
            <div className='flex flex-col'>
              <TextField
                id='outlined-controlled'
                label='Search'
                sx={{ maxWidth: '350px' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl
                variant='standard'
                sx={{ m: 1, minWidth: 180, maxWidth: '100px' }}
              >
                <InputLabel id='demo-simple-select-standard-label'>
                  Sort by
                </InputLabel>
                <Select
                  labelId='demo-simple-select-standard-label'
                  id='demo-simple-select-standard'
                  value={sortReviews}
                  onChange={(e) => setSortReviews(e.target.value)}
                  label='Sort by'
                >
                  <MenuItem value='relevant'>Most Relevant</MenuItem>
                  <MenuItem value='ratings'>Ratings</MenuItem>
                  <MenuItem value='budget'>Budget</MenuItem>
                  <MenuItem value='date'>Date</MenuItem>
                </Select>
              </FormControl>
            </div>
          </StyledEngineProvider>
          <hr className='separator' />

          <div className='flex flex-col gap-5'>
            {reviews.map((review, index) => (
              <div
                key={index}
                className='flex flex-col gap-3 pt-2 pb-5 border-b last:border-b-0 border-b-light-white'
              >
                <div className='flex gap-3'>
                  <div className='h-[46px] w-[46px] rounded-full overflow-hidden relative'>
                    <Image
                      sizes='24'
                      className='object-cover'
                      src={review.image}
                      fill
                      alt='user'
                    />
                  </div>
                  <div>
                    <p>{review.name}</p>
                    <div className='flex gap-2 items-center'>
                      <ReactCountryFlag countryCode={review.countryCode} />
                      <span>{review.country}</span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center'>
                  {[...Array(4)].map((r, ri) => (
                    <FaStar
                      className='lg:h-[24px] lg:w-[24px]'
                      key={ri}
                      color={
                        ri + 1 > review.ratings
                          ? 'white'
                          : 'var(--theme-primary)'
                      }
                    />
                  ))}
                  <span className='text-light-grey ml-2'>| {review.time}</span>
                </div>
                <p className='mt-2'>{review.description}</p>
                <div className='flex gap-4'>
                  <p>Helpful?</p>
                  <div className='flex gap-3'>
                    <div className='cta-vote'>
                      <FaRegThumbsUp />
                      Yes
                    </div>
                    <div className='cta-vote'>
                      <FaRegThumbsDown />
                      No
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {browsingUser && showMessageBox && (
        <ChatPopup
          {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }}
        />
      )}

      {loading && <FullScreenLoader />}

      <SuccessScreen
        title={'You have successfully updated your profile'}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              flipEdit(), setSuccess(false);
            }}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            See Profile
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
      <Alert
        className={`absolute top-2 z-10 transform duration-300 transition-all ${
          copied ? 'right-5' : '-right-full'
        }`}
        severity='success'
      >
        Profile Link Copied to clipboard
      </Alert>
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const { query } = context;

  if (query.slug) {
    try {
      const initFreelancer = await getFreelancerProfile(query.slug);

      if (initFreelancer) {
        return { props: { isAuthenticated: true, initFreelancer } };
      }
    } catch (error) {
      console.error(error); // TODO:
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

export default Profile;
