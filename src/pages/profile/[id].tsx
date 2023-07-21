/* eslint-disable no-console */
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Divider, OutlinedInput, TextField, Tooltip } from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BiEdit } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import AccountChoice from '@/components/AccountChoice';
import { TextArea } from '@/components/Briefs/TextArea';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import CountrySelector from '@/components/Profile/CountrySelector';
import UploadImage from '@/components/Profile/UploadImage';
import SuccessScreen from '@/components/SuccessScreen';

import * as config from '@/config';
import { Brief, User } from '@/model';
import { authenticate } from '@/pages/api/info/user';
import { fetchUserRedux } from '@/redux/reducers/userReducers';
import { getUserBriefs } from '@/redux/services/briefService';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';
import { AppDispatch } from '@/redux/store/store';
import styles from '@/styles/modules/freelancers.module.css';

import { checkEnvironment, updateUser } from '../../utils';

const Profile = ({ initUser, browsingUser }: any) => {
  const router = useRouter();
  // const slug = router.query.slug as string;
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [user, setUser] = useState<any>(initUser);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [targetUser] = useState<User | null>(null);
  const [openBriefs, setOpenBriefs] = useState<Brief[]>([]);

  const isProfileOwner = browsingUser && browsingUser?.id === initUser?.id;

  const [openAccountChoice, setOpenAccountChoice] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const getBriefs = async () => {
      const myBriefs = await getUserBriefs(user?.id);
      setOpenBriefs(myBriefs?.briefsUnderReview);
    };

    getBriefs();
  }, [user?.id]);

  const onSave = async (user: any) => {
    try {
      if (user) {
        setLoading(true);
        const userResponse: any = await updateUser(user);

        if (userResponse.status === 'Successful') {
          setSuccess(true);
        } else {
          setError(userResponse);
        }
      }
    } catch (error) {
      setError({message: error});
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = async () => {
    try {
      const resp = await updateUser(initUser);
      if (resp.status === 'Successful') {
        setUser(initUser);
        setIsEditMode(false);
        dispatch(fetchUserRedux());
      } else {
        setError({
          message:
            'Could not revert to previous profile photo. Please try again',
        });
      }
    } catch (error) {
      setError({
        message: 'Could not revert to previous profile photo. Please try again',
      });
    }
  };

  // cs

  const flipEdit = () => {
    setIsEditMode(!isEditMode);
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
        setUser({
          ...user,
          web3_address: account.address,
          web3_type: account.source,
        });
      }
    } catch (error) {
      setError({message: error});
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const navigateToLink = (link: string) => {
    if (!link) return;

    const regEx = /^http/;
    if (!regEx.test(link)) link = `https://${link}`;
    window.open(link, '_blank');
  };

  return (
    <div className='profile-container'>
      <div className='cursor-pointer absolute top-28 left-16 lg:left-24 z-[1]'>
        <Tooltip
          title="Go back to previous page"
          followCursor
          leaveTouchDelay={10}
          enterDelay={500}
        >
          <div
            onClick={() => router.back()}
            className='border rounded-full p-1 flex items-center justify-center absolute right-5 top-5 group hover:bg-white'
          >
            <ArrowBackIcon className='h-6 w-6 text-white group-hover:text-black' />
          </div>
        </Tooltip>
      </div>
      <div className='banner absolute left-0 right-0'>
        <Image
          src={require('@/assets/images/profile-banner.png')}
          priority
          alt='profile banner'
          className='banner-image w-full object-cover h-60'
        />
      </div>

      <div className='pt-60'>
        <div className='flex flex-col lg:items-center gap-5 lg:gap-16 w-full px-4 lg:px-0'>
          <div className='w-full flex flex-col gap-4 pb-8 px-10 lg:px-16 bg-white rounded-xl border border-light-white relative'>
            <div className='w-fit'>
              <UploadImage
                setUser={setUser}
                user={user}
                isEditMode={isEditMode}
                saveChanges={updateUser}
              />
            </div>
            <div className='w-full flex flex-col gap-4'>
              {isEditMode ? (
                <TextField
                  color='secondary'
                  onChange={(e) => handleChange(e)}
                  id='outlined-basic'
                  name='display_name'
                  label='Name'
                  variant='outlined'
                  defaultValue={user?.display_name}
                />
              ) : (
                <p className='!text-2xl capitalize text-imbue-purple-dark'>
                  {user?.display_name}
                </p>
              )}

              {isEditMode ? (
                <TextField
                  color='secondary'
                  onChange={(e) => handleChange(e)}
                  className='w-full'
                  id='outlined-basic'
                  name='username'
                  label='Username'
                  variant='outlined'
                  defaultValue={user?.username}
                />
              ) : (
                <p className='text-base text-primary max-w-full break-words'>
                  @{user?.username}
                </p>
              )}

              <div>
                <CountrySelector
                  user={user}
                  setUser={setUser}
                  {...{ isEditMode }}
                />
              </div>

              <div className='flex flex-col gap-6 lg:flex-row lg:justify-between'>
                <div className='w-full lg:w-1/3'>
                  {!isEditMode && (
                    <div className='mt-5 flex items-center gap-4'>
                      {user?.website && (
                        <button
                          onClick={() => navigateToLink(user.website)}
                          className='primary-btn in-dark w-button'
                        >
                          View Website
                        </button>
                      )}
                      {/* <button className='primary-btn in-dark w-button'>
                        Follow
                      </button> */}
                    </div>
                  )}
                </div>
                {/* TODO: Implement reviews */}

                <div className='rating flex flex-col gap-3 text-imbue-purple-dark'>
                  <div>
                    <span>Top Rated</span>
                    <span className='review-count ml-1 text-imbue-purple'>
                      (1,434 reviews)
                    </span>
                  </div>
                  <div className='mb-3'>
                    <FaStar size={30} color='var(--theme-primary)' />
                    <FaStar size={30} color='var(--theme-primary)' />
                    <FaStar size={30} color='var(--theme-primary)' />
                    <FaStar size={30} color='var(--theme-light-grey)' />
                  </div>
                </div>

                <div className='w-full lg:w-3/12'>
                  {user?.web3_address && (
                    <div className='w-full'>
                      <p className='text-xl text-imbue-purple-dark'>
                        Wallet Address
                      </p>
                      <div className='mt-3 break-words p-4 mb-4 rounded-md text-content-primary bg-imbue-light-purple'>
                        {user?.web3_address}
                      </div>
                    </div>
                  )}


                  {isEditMode && (
                    <button
                      onClick={() => setOpenAccountChoice(true)}
                      className='primary-btn in-dark w-full'
                    >
                      Connect wallet
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isProfileOwner && (
              <div className='absolute top-5 right-5 cursor-pointer'>
                <span className='text-imbue-purple mr-2'>Edit</span>
                <BiEdit
                  onClick={() => setIsEditMode(!isEditMode)}
                  size={30}
                  color='#3B27C1'
                />
              </div>
            )}

            <AccountChoice
              accountSelected={(account: WalletAccount) =>
                accountSelected(account)
              }
              visible={openAccountChoice}
              setVisible={setOpenAccountChoice}
            />
          </div>

          <div
            className={`${styles.freelancerProfileSection} w-full py-8 lg:!px-16`}
          >
            {(user?.about || isEditMode) && (
              <>
                <div className='header-editable'>
                  <h5 className='text-xl text-imbue-purple-dark'>About</h5>
                </div>

                {isEditMode ? (
                  <>
                    <TextArea
                      maxLength={1000}
                      value={user?.bio}
                      onChange={(e) => {
                        if (user) {
                          setUser({
                            ...user,
                            about: e.target.value,
                          });
                        }
                      }}
                      rows={8}
                      className='bio-input px-4 py-2 bg-transparent text-imbue-purple-dark border border-imbue-purple'
                      id='bio-input-id'
                      defaultValue={user?.about}
                    />
                  </>
                ) : (
                  <>
                    {user?.about && (
                      <div className='bio text-imbue-purple'>
                        {user?.about}
                        {/* {user?.bio
                                        ?.split?.("\n")
                                        ?.map?.((line: any, index: number) => (
                                            <p className="leading-[1.2] text-base" key={index}>
                                                {line}
                                            </p>
                                        ))} */}
                        {/* Welcome to a vibrant and multiple award-winning
                  telecommunications service provider. Our aim is to bring
                  people and businesses together in what we do best, by offering
                  mobile and fixed services, broadband connectivity and IPTV
                  services to people, homes and businesses. The Blockchain world
                  has never been more exciting than right now. But in this
                  fast-growing space, finding top talent and the perfect project
                  can be tough | Cryptocurrency | Blockchain | Ethereum | Web3 |
                  Smart Contract | DApps | DeFi | Solidity | Hyperledger |
                  Polkadot Rust | C | C ++ | C# | Python | Golang | Java |
                  Javascript | Scala | Simplicity | Haskell | */}
                      </div>
                    )}
                  </>
                )}

                <Divider />
              </>
            )}

            {(user?.website || isEditMode) && (
              <div className='flex gap-14 items-center'>
                <p className='w-24 lg:text-xl text-imbue-purple-dark'>
                  Website :
                </p>
                {isEditMode ? (
                  <div className='h-auto w-full lg:w-2/3 flex justify-between items-center'>
                    <OutlinedInput
                      defaultValue={user?.website}
                      name='website'
                      onChange={(e) => handleChange(e)}
                      className='w-full border border-imbue-purple'
                    />
                  </div>
                ) : (
                  <span className='text-imbue-purple'>{user?.website}</span>
                )}
              </div>
            )}

            {user?.industry && (
              <div className='flex gap-14 items-center'>
                <p className='w-24 text-imbue-purple-dark lg:text-xl'>
                  Industry :
                </p>
                {isEditMode ? (
                  <div className='h-auto w-full lg:w-2/3 flex justify-between items-center'>
                    <OutlinedInput
                      defaultValue={user?.industry}
                      name='industry'
                      onChange={(e) => handleChange(e)}
                      className='w-full border border-imbue-purple'
                    />
                  </div>
                ) : (
                  <span className='text-imbue-purple'>{user?.industry}</span>
                )}
              </div>
            )}

            <div className='flex gap-14 items-center'>
              <p className='w-24 text-imbue-purple-dark lg:text-xl'>Member :</p>
              <span className='text-imbue-purple'>
                {moment(user?.created).format('MMM DD, YYYY')}
              </span>
            </div>
            <div className='flex gap-14 items-center'>
              <p className='w-24 text-imbue-purple-dark lg:text-xl'>Hired :</p>
              <span className='text-imbue-purple'>58</span>
            </div>
          </div>

          <div className='w-full bg-white rounded-xl'>
            <p className='px-10 lg:px-16 py-6 text-xl text-imbue-purple-dark'>
              Open Briefs
            </p>
            <div className='briefs-list w-full'>
              {openBriefs?.map(
                (item, itemIndex) =>
                  !item?.project_id && (
                    <div
                      className='brief-item !px-10 lg:!px-16 rounded-b-xl'
                      key={itemIndex}
                      onClick={() => router.push(`/briefs/${item?.id}/`)}
                    >
                      <div className='brief-title !text-xl lg:!text-2xl'>
                        {
                          item.headline.length > 50
                            ? `${item.headline.substring(0, 50)}...`
                            : item.headline
                        }
                      </div>
                      <div className='brief-time-info !text-sm lg:!text-base'>
                        {`${item.experience_level}, ${item.duration}, Posted by ${item.created_by}`}
                      </div>
                      <div className='brief-description !text-sm lg:!text-base'>
                        {
                          item.description.length > 400
                            ? `${item.description.substring(0, 400)}...`
                            : item.description
                        }
                      </div>

                      <div className='brief-tags'>
                        {item.skills?.map((skill: any, skillIndex: any) => (
                          <div className='tag-item' key={skillIndex}>
                            {skill}
                          </div>
                        ))}
                      </div>

                      <div className='brief-proposals !text-xs lg:!text-sm'>
                        <span className='proposals-heading'>
                          Proposals Submitted:{' '}
                        </span>
                        <span className='proposals-count'>
                          {item.number_of_briefs_submitted}
                        </span>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      {user && showMessageBox && (
        <ChatPopup
          {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }}
          showFreelancerProfile={false}
        />
      )}

      {isEditMode && (
        <div className='mt-5'>
          <button
            onClick={() => onSave(user)}
            className='primary-btn in-dark w-button'
          >
            Save Changes
          </button>
          <button
            onClick={cancelEdit}
            className='primary-btn in-dark w-button !bg-red-600'
          >
            Cancel
          </button>
        </div>
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
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const { req, res, query } = context;

  try {
    const resp = await fetch(
      checkEnvironment().concat(`${config.apiBase}users/${query?.id}`),
      {
        headers: config.getAPIHeaders,
      }
    );
    const initUser = await resp.json();

    const browsingUser = await authenticate('jwt', req, res);

    if (browsingUser) {
      return {
        props: {
          isAuthenticated: true,
          browsingUser,
          initUser: initUser || {},
        },
      };
    }
  } catch (error: any) {
    console.error(error);
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

export default Profile;
