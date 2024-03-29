/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  Alert,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Tooltip,
} from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import Filter from 'bad-words';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { BsPencilSquare } from 'react-icons/bs';
import {
  FaDiscord,
  FaFacebook,
  FaRegShareSquare,
  FaStar,
  FaTelegram,
  FaTwitter,
} from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { GrCertificate } from 'react-icons/gr';
import { ImStack } from 'react-icons/im';
import { IoPeople } from 'react-icons/io5';
import { MdOutlineWatchLater } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { checkEnvironment, fetchUser, matchedByUserName } from '@/utils';
import {
  isNumOrSpecialCharacter,
  isUrlAndSpecialCharacterExist,
  isUrlExist,
  isValidAddressPolkadotAddress,
} from '@/utils/helper';

import AccountChoice from '@/components/AccountChoice';
import { TextArea } from '@/components/Briefs/TextArea';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import LoginPopup from '@/components/LoginPopup/LoginPopup';
import Clients from '@/components/Profile/Clients';
import CountrySelector from '@/components/Profile/CountrySelector';
import Skills from '@/components/Profile/Skills';
import UploadImage from '@/components/Profile/UploadImage';
import ReviewSection from '@/components/Review/ReviewSection';
import SuccessScreen from '@/components/SuccessScreen';

import { Currency, Freelancer, Project, User } from '@/model';
import { fetchUserRedux } from '@/redux/reducers/userReducers';
import { setUserAnalytics } from '@/redux/services/briefService';
import {
  getFreelancerApplications,
  getFreelancerProfile,
  updateFreelancer,
} from '@/redux/services/freelancerService';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';
import { AppDispatch, RootState } from '@/redux/store/store';
import styles from '@/styles/modules/freelancers.module.css';

export type ProfileProps = {
  initFreelancer: Freelancer;
};

const invalidUsernames = [
  'username',
  'imbue',
  'imbuenetwork',
  'polkadot',
  'password',
  'admin',
];

const Profile = ({ initFreelancer }: ProfileProps): JSX.Element => {
  const filter = new Filter({ placeHolder: ' ' });
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<any>(initFreelancer);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [hideLinkedAccounts, setHideLinkedAccounts] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>();
  const [loadValue, setLoadValue] = useState(5);
  const [displayError, setDisplayNameError] = useState<string | null>(null);
  const [userNameError, setUserNameError] = useState<string | null>(null);
  const memberSince = moment(freelancer?.created).format('MMMM YYYY');
  const [prevUserName, setprevUserName] = useState(freelancer.username);
  const [titleError, settitleError] = useState<string | null>(null);
  const [hourperrate, setHourPerrate] = useState<number | undefined>(
    freelancer.hour_per_rate
  );
  const [skills, setSkills] = useState<string[]>(
    freelancer?.skills?.map(
      (skill: { id: number; name: string }) =>
        skill?.name?.charAt(0).toUpperCase() + skill?.name?.slice(1)
    )
  );

  const { user: browsingUser, loading: browsingUserLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const dispatch = useDispatch<AppDispatch>();

  const isCurrentFreelancer =
    browsingUser && browsingUser?.id === freelancer?.user_id;

  const [openAccountChoice, setOpenAccountChoice] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string>('');
  const [userNameExist, setUserNameExist] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);

  const [clients, setClients] = useState<any>(
    initFreelancer?.clients ? initFreelancer.clients : []
  );

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
        const userHasNoSocial =
          !freelancer.facebook_link &&
          !freelancer.telegram_link &&
          !freelancer.twitter_link &&
          !freelancer.discord_link;
        const hideLinkedAccounts = userHasNoSocial && !isCurrentFreelancer;
        setHideLinkedAccounts(hideLinkedAccounts);
        setTargetUser(await fetchUser(freelancer?.user_id));
        setProjects(await getFreelancerApplications(freelancer?.user_id));
      }
    };
    setup();
  }, [freelancer, browsingUser.username]);

  //The fields must be pre populated correctly.
  const onSave = async () => {
    try {
      if (freelancer) {
        if (filter.isProfane(freelancer.display_name)) {
          setError({ message: 'Remove bad word from name' });
          return;
        }
        if (filter.isProfane(freelancer.username)) {
          setError({ message: 'Remove bad word from username' });
          return;
        }
        if (userNameError || displayError) {
          setError({ message: userNameError || displayError });
          return;
        }
        if (userNameExist) {
          setError({ message: 'Username is already exist try another one' });
          return;
        }
        setLoading(true);

        if (invalidUsernames.includes(freelancer.username)) {
          setError({ message: 'Invalid username' });
          return;
        }

        let data = freelancer;
        data = {
          ...data,
          about: freelancer?.about?.trim()?.length
            ? filter.clean(freelancer.about).trim()
            : '',
          education: freelancer?.education?.trim()?.length
            ? filter.clean(freelancer.education).trim()
            : '',
          title: freelancer?.title?.trim()?.length
            ? filter.clean(freelancer.title).trim()
            : '',
          skills: skills,
          clients: clients,
          logged_in_user: browsingUser.id === initFreelancer.user_id,
          hour_per_rate: hourperrate,
        };

        const resp: any = await updateFreelancer(data);
        if (resp.status) {
          setSuccess(true);
          setprevUserName(data.username);
        } else {
          setError({
            message: 'Someting went wrong' + JSON.stringify(resp.message),
          });
        }
      }
    } catch (error) {
      setError({ message: 'Someting went wrong' + error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateFreelancerAnalytics = async () => {
      await setUserAnalytics(browsingUser.id, freelancer.user_id);
    };
    if (!browsingUserLoading && browsingUser.id !== freelancer.user_id) {
      updateFreelancerAnalytics();
    }
  }, [browsingUser]);

  const handleMessageBoxClick = () => {
    if (browsingUser.id) {
      setShowMessageBox(true);
    } else {
      setShowLoginPopup(true);
    }
  };

  const flipEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const handleUpdateState = async (e: any) => {
    const newFreelancer = {
      ...freelancer,
      [e?.target?.name]: e.target.value,
    };

    if (e.target.name === 'title') {
      if (isUrlExist(e.target.value))
        settitleError('Url is not allowed in the title');
      else settitleError(null);
    }
    if (e.target.name === 'display_name') {
      if (
        newFreelancer.display_name.trim().length < 1 &&
        newFreelancer.display_name.trim().length > 30
      ) {
        setDisplayNameError(
          'Display name must be between 1 to 30 characters long'
        );
      } else if (isUrlExist(e.target.value)) {
        setDisplayNameError(
          'URL and special characters are not allowed in display name'
        );
      } else setDisplayNameError(null);
    }

    if (e.target.name === 'username') {
      if (e.target.value.length < 5 || e.target.value.length > 30)
        setUserNameError('username must be at least 5 to 30 characters long');
      else if (isUrlAndSpecialCharacterExist(e.target.value)) {
        setUserNameError('URL,special characters are not allowed in username');
      } else if (
        !isValidAddressPolkadotAddress(e.target.value) &&
        isNumOrSpecialCharacter(e.target.value.at(0))
      ) {
        setUserNameError('username must start with 1 letter');
      } else setUserNameError(null);
      const data = await matchedByUserName(e.target.value);
      if (data?.id && e.target.value !== prevUserName) {
        setUserNameExist(true);
      } else setUserNameExist(false);
    }
    setFreelancer(newFreelancer);
  };

  const cancelEdit = async () => {
    try {
      await updateFreelancer({
        ...initFreelancer,
        skills: initFreelancer?.skills?.map(
          (skill: { id: number; name: string }) =>
            skill?.name?.charAt(0).toUpperCase() + skill?.name?.slice(1)
        ),
        clients: initFreelancer?.clients,
        logged_in_user: browsingUser,
      });

      setFreelancer(initFreelancer);
      setIsEditMode(false);
      setClients(initFreelancer?.clients);
      dispatch(fetchUserRedux());
    } catch (error) {
      setError({
        message: 'Could not revert to previous profile photo. Please try again',
      });
    }
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
      setError({ message: error });
      console.log(error);
    }
  };

  const socials = [
    {
      label: 'Facebook',
      key: 'facebook_link',
      value: freelancer?.facebook_link,
      // value: 'facebook.com',
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
      value: freelancer?.twitter_link,
      // value: 'twitter.com',
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



  // const clinetsData = [
  //   {
  //     name: "Fiverr",
  //     logo: "https://res.cloudinary.com/ssani7/image/upload/v1686857275/imbue/loader_mrgfrj.svg",
  //     website: "fiverr.com",
  //   },
  //   {
  //     name: "Imbue",
  //     logo: "https://res.cloudinary.com/ssani7/image/upload/v1686857275/imbue/loader_mrgfrj.svg",
  //     website: "imbue.com",
  //   },
  // ];

  const copyToClipboard = ({
    text,
    title,
  }: {
    text?: string;
    title: string;
  }) => {
    let textToCopy = text || '';

    if (title === 'Profile Link') {
      textToCopy = checkEnvironment().concat(`${router.asPath}`);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(title);

    setTimeout(() => {
      setCopied('');
    }, 3000);
  };

  return (
    <div className='profile-container'>
      <div className='h-[242px]'>
        <Image
          src={require('@/assets/images/profile_banner.png')}
          priority
          alt='profile banner'
          className='banner-image w-full object-cover h-[242px] absolute left-0 right-0'
        />
      </div>

      <div className='cursor-pointer absolute top-28 left-16 lg:left-24 z-[1]'>
        <Tooltip
          title='Go back to previous page'
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

      <div className='flex flex-col lg:flex-row justify-evenly lg:mx-[40px] px-[30px] lg:px-[40px]'>
        <div className='flex flex-col lg:items-center gap-[20px] lg:gap-[70px] lg:w-[40%]'>
          <div className='w-full flex flex-col gap-4 pb-8 lg:px-10 bg-white rounded-xl'>
            <div className='w-full flex flex-col items-start px-10 relative'>
              {isCurrentFreelancer && !isEditMode && (
                <div
                  onClick={() => setIsEditMode(true)}
                  className='flex items-center absolute top-5 right-5 gap-2 cursor-pointer'
                >
                  <span className='text-imbue-purple'>Edit</span>
                  <div className='border border-imbue-purple rounded-full p-1 flex items-center justify-center'>
                    <BsPencilSquare color='var(--theme-purple)' />
                  </div>
                </div>
              )}

              <UploadImage
                isEditMode={isEditMode}
                initUserData={{
                  ...initFreelancer,
                  skills: freelancer?.skills?.map(
                    (skill: { id: number; name: string }) =>
                      skill?.name?.charAt(0).toUpperCase() +
                      skill?.name?.slice(1)
                  ),
                  logged_in_user: browsingUser,
                }}
                currentUserData={freelancer}
                setUser={setFreelancer}
                saveChanges={updateFreelancer}
                setError={setError}
              />
              <div className='w-full flex flex-col gap-[16px] mt-5'>
                {isEditMode ? (
                  <>
                    <TextField
                      onChange={(e) => handleUpdateState(e)}
                      id='outlined-basic'
                      name='display_name'
                      label='Name'
                      variant='outlined'
                      color='secondary'
                      defaultValue={freelancer?.display_name || ''}
                      autoComplete='off'
                      inputProps={{ maxLength: 30 }}
                    />
                    {displayError && (
                      <p
                        className={`text-xs text-imbue-light-purple-two mt-[-34px]
                    `}
                      >
                        {displayError}
                      </p>
                    )}

                    <FormControl fullWidth sx={{ m: 1 }}>
                      <InputLabel
                        className='!text-imbue-purple'
                        htmlFor='outlined-adornment-amount'
                      >
                        payment per hour
                      </InputLabel>
                      <OutlinedInput
                        id='outlined-adornment-amount'
                        label='payment per hour'
                        onChange={(event: any) =>
                          setHourPerrate(
                            event.target.value > 0
                              ? Math.trunc(event.target.value)
                              : undefined
                          )
                        }
                        className='w-full'
                        value={hourperrate}
                        defaultValue={freelancer?.hour_per_rate}
                        placeholder='0.00'
                        type='number'
                        color='secondary'
                        startAdornment={
                          <InputAdornment
                            className='text-imbue-purple'
                            position='start'
                          >
                            $
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </>
                ) : (
                  <div className='flex justify-between'>
                    <div className='flex gap-2'>
                      <h3 className='!text-2xl z-[1] text-imbue-purple'>
                        {freelancer?.display_name}
                      </h3>
                      {initFreelancer?.verified && (
                        <div className='bg-[#EAFFC2] flex items-center px-2 rounded-full'>
                          <VerifiedIcon htmlColor='#38e894' />
                          <span className='text-sm ml-1 text-imbue-purple'>
                            verified
                          </span>
                        </div>
                      )}
                    </div>
                    <p className='text-imbue-purple text-xl'>
                      ${Number(freelancer?.hour_per_rate).toFixed(2)}
                      <span className='text-sm'>/hr</span>
                    </p>
                  </div>
                )}

                <div className='flex gap-4 flex-col'>
                  {isEditMode ? (
                    <>
                      <TextField
                        onChange={(e) => handleUpdateState(e)}
                        className='w-full'
                        id='outlined-basic'
                        name='username'
                        label='Username'
                        variant='outlined'
                        color='secondary'
                        defaultValue={freelancer?.username || ''}
                        autoComplete='off'
                        inputProps={{ maxLength: 30 }}
                      />
                      {userNameError && (
                        <p
                          className={`text-xs text-imbue-light-purple-two mt-[-34px]
                    `}
                        >
                          {userNameError}
                        </p>
                      )}
                      {userNameExist && (
                        <p
                          className={`text-xs text-imbue-light-purple-two mt-[-34px]
                    `}
                        >
                          username is already exist try another one
                        </p>
                      )}
                    </>
                  ) : (
                    <p className='text-[16px] leading-[1.2] text-imbue-purple max-w-full break-words'>
                      @{freelancer?.username}
                    </p>
                  )}

                  <div className='flex items-center gap-2 w-full'>
                    {isEditMode ? (
                      <div>
                        <TextField
                          color='secondary'
                          onChange={(e) => handleUpdateState(e)}
                          className='w-full'
                          id='outlined-basic'
                          name='title'
                          label='Tittle'
                          variant='outlined'
                          defaultValue={freelancer?.title || ''}
                          autoComplete='off'
                        />
                        {titleError && (
                          <p
                            className={`text-xs text-imbue-light-purple-two mt-[-15px]
                    `}
                          >
                            {titleError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <IoPeople color='var(--theme-secondary)' size='24px' />
                        <p className='text-[16px] break-all leading-[1.2] text-imbue-purple'>
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

                <div className='rating flex gap-3'>
                  <p className='mb-3'>
                    <FaStar color='var(--theme-primary)' />
                    <FaStar color='var(--theme-primary)' />
                    <FaStar color='var(--theme-primary)' />
                    <FaStar color='var(--theme-purple-light)' />
                  </p>
                  <p className='text-imbue-purple'>
                    <span>Top Rated</span>
                    <span className='review-count ml-1'>(1,434 reviews)</span>
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
                      {!isEditMode && (
                        <div className='flex gap-6 mb-5'>
                          <button
                            onClick={() => flipEdit()}
                            className='message'
                          >
                            Edit Profile <FiEdit />
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard({ title: 'Profile Link' })
                            }
                            className='share'
                          >
                            <FaRegShareSquare color='white' />
                            Share Profile
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className='flex gap-6 mb-5'>
                      <button
                        onClick={() => handleMessageBoxClick()}
                        className='bg-imbue-light-purple border-0 !text-content-primary'
                      >
                        Message
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard({ title: 'Profile Link' })
                        }
                        className='share'
                      >
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
                  <button onClick={copyProfile} className="share">
                    <FaRegShareSquare color="white" />
                    Share Profile
                  </button>
                ) : (
                  <button
                    onClick={() => cancelEdit()}
                    className="message !bg-red-600"
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
            </div>

            {((clients && clients?.length > 0) || isEditMode) && (
              <>
                <hr className='separator' />
                <div className='px-10 flex flex-col gap-4'>
                  <div className='flex items-center gap-3'>
                    <p className='text-xl text-imbue-purple-dark'>
                      Among my clients
                    </p>
                    <Tooltip
                      title='Organizations or companiest that you have previously worked with. Add their name, website and logo for recongintion'
                      enterTouchDelay={10}
                      leaveTouchDelay={4000}
                      arrow
                      placement='bottom'
                    >
                      <span className='h-4 w-4 flex justify-center items-center rounded-full bg-imbue-light-purple text-imbue-purple cursor-pointer'>
                        ?
                      </span>
                    </Tooltip>
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
                </div>
              </>
            )}

            {freelancer?.web3_address && (
              <>
                <hr className='separator' />
                <div className='w-full px-[30px] lg:px-[40px]'>
                  <p className='text-xl text-imbue-purple-dark'>
                    Wallet Address
                  </p>
                  <div className='flex items-center mt-2 gap-3 w-full'>
                    <div className='break-words py-4 px-3 rounded-2xl bg-imbue-light-purple w-[90%] lg:w-full text-imbue-purple'>
                      {freelancer?.web3_address}
                    </div>
                    <div
                      onClick={() =>
                        copyToClipboard({
                          text: freelancer?.web3_address || '',
                          title: 'Web 3 address',
                        })
                      }
                      className='p-1 border border-imbue-purple rounded-full cursor-pointer'
                    >
                      <ContentCopyIcon htmlColor='#3b27c1' />
                    </div>
                  </div>
                </div>
              </>
            )}

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

            <div className='w-full px-[30px] lg:px-[40px] text-imbue-purple-dark'>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <AiOutlineUser size={24} />
                  <p>Member Since</p>
                </div>
                <p className='text-imbue-purple'>{memberSince}</p>
              </div>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <MdOutlineWatchLater size={24} />
                  <p>Last project Delivery</p>
                </div>
                <p className='text-imbue-purple'>2 hour</p>
              </div>
              <div className='flex justify-between mb-3'>
                <div className='flex items-center gap-4'>
                  <ImStack size={24} />
                  <p>Number of projects</p>
                </div>
                <p className='text-imbue-purple'>{projects?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className='flex w-full'>
            <div className='flex flex-col gap-[36px] grow shrink-0 basis-[40%]'>
              <div className={`${styles.freelancerProfileSection}`}>
                {!hideLinkedAccounts && (
                  <>
                    <div className='lg:mx-[40px] text-imbue-purple-dark'>
                      <h5>Linked Account</h5>
                      <div className='flex flex-col gap-[16px] mt-[24px]'>
                        {socials?.map(
                          ({ label, key, value, icon }: any, index: number) =>
                            (isCurrentFreelancer || value) && (
                              <div
                                className='h-auto flex justify-between items-center'
                                key={index}
                              >
                                <p className='text-base'>{label} </p>
                                {isEditMode ? (
                                  <div
                                    className='h-auto w-full lg:w-2/3 flex justify-between items-center'
                                    key={index}
                                  >
                                    <TextField
                                      color='secondary'
                                      autoComplete='off'
                                      value={
                                        (freelancer && freelancer[key]) || ''
                                      }
                                      onChange={(e) => {
                                        if (freelancer) {
                                          setFreelancer({
                                            ...freelancer,
                                            [key]: e.target.value,
                                          });
                                        }
                                      }}
                                      //   className="bio-input"
                                      className='bg-transparent text-imbue-purple border border-imbue-purple !m-0 w-full'
                                      id='bio-input-id'
                                    />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      !value &&
                                      isCurrentFreelancer &&
                                      setIsEditMode(true)
                                    }
                                    className='bg-imbue-light-purple w-[32px] h-[32px] rounded-[10px] text-imbue-purple border-none text-[20px] font-semibold items-center justify-center'
                                  >
                                    {socials && value ? icon : '+'}
                                  </button>
                                )}
                              </div>
                            )
                        )}
                      </div>
                    </div>
                    <hr className='separator' />
                  </>
                )}

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
                <div className='lg:mx-[40px]'>
                  <div className='header-editable text-imbue-purple-dark'>
                    <h5>Certification</h5>
                    <div className='flex gap-3 mt-4'>
                      <div className='bg-theme-secondary h-11 w-11 rounded-full flex justify-center items-center'>
                        <GrCertificate className={styles.whiteIcon} size={24} />
                      </div>
                      <div>
                        <p className='text-imbue-purple'>
                          Web3 Certification of participation
                        </p>
                        <p className='text-imbue-purple'>Jan 14</p>
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
            className={`${styles.freelancerProfileSection} w-full py-[30px] lg:px-[40px]`}
          >
            <div className='header-editable lg:mx-10'>
              <h5 className='text-imbue-purple-dark'>About</h5>
            </div>
            {isEditMode ? (
              <>
                <TextArea
                  maxLength={1000}
                  value={freelancer?.about || ''}
                  onChange={(e) => {
                    if (freelancer) {
                      setFreelancer({
                        ...freelancer,
                        about: e.target.value,
                      });
                    }
                  }}
                  rows={8}
                  className='px-4 py-2 bg-tranparent text-content-primary border border-imbue-purple'
                  id='bio-input-id'
                />
              </>
            ) : (
              <div className='bio text-content-primary text-base lg:mx-10 break-all whitespace-pre-wrap'>
                {freelancer?.about}
              </div>
            )}
            <hr className='separator' />

            <div className='header-editable lg:mx-10'>
              <h5 className='text-imbue-purple-dark'>Education</h5>
            </div>
            {isEditMode ? (
              <>
                <TextArea
                  maxLength={1000}
                  value={freelancer?.education || ''}
                  onChange={(e) => {
                    if (freelancer) {
                      setFreelancer({
                        ...freelancer,
                        education: e.target.value,
                      });
                    }
                  }}
                  rows={8}
                  className='px-4 py-2 bg-tranparent text-content-primary border border-imbue-purple'
                  id='bio-input-id'
                />
              </>
            ) : (
              <>
                <div className='bio text-imbue-purple break-all lg:mx-10'>
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
          <div className='connect-buttons w-full'>
            {isCurrentFreelancer && (
              <>
                {isEditMode && (
                  <div className='flex gap-6 mb-5'>
                    <button onClick={() => onSave()} className='message'>
                      Save Changes <FiEdit />
                    </button>
                    <button
                      onClick={() => cancelEdit()}
                      className='message !bg-red-600 !border-0'
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className='lg:w-[50%] mt-[20px] lg:mt-0'>
          <div className='bg-white rounded-xl lg:px-10'>
            <div className='px-8 lg:px-10 py-8'>
              <h3 className='mb-3 text-imbue-purple-dark'>Work History</h3>
              <p className='text-imbue-purple'>
                Completed Projects ({projects?.length || 0})
              </p>
            </div>
            <hr className='separator' />
            <div>
              {projects?.map(
                (v, i) =>
                  i < Math.min(Math.max(loadValue, 5), projects.length) && (
                    <div
                      key={i}
                      className='px-8 lg:px-10 py-8 flex flex-col gap-3 border-b last:border-b-0 border-b-imbue-light-purple'
                    >
                      <p className='text-xl text-imbue-purple-dark'>
                        {v?.name}
                      </p>
                      <div className='flex gap-3 lg:gap-8 flex-wrap items-center justify-between'>
                        <div className='flex'>
                          {[...Array(4)].map((r, ri) => (
                            <FaStar
                              className='lg:h-[24px] lg:w-[24px]'
                              key={ri}
                              color={
                                ri + 1 > work.ratings
                                  ? 'var(--theme-light-purple)'
                                  : 'var(--theme-primary)'
                              }
                            />
                          ))}
                        </div>
                        <p className='text-imbue-purple text-sm'>
                          {moment(v?.created).format('Do MMM YYYY')}
                        </p>
                      </div>
                      <p className='text-imbue-purple-dark break-all'>
                        {v?.description?.length > 500
                          ? v?.description.substring(0, 500)
                          : v?.description}
                      </p>
                      <div className='flex gap-1  text-imbue-purple'>
                        <p className=''>{v?.required_funds}</p>
                        <p className=''>{Currency[v?.currency_id]}</p>
                      </div>
                    </div>
                  )
              )}
              {projects && loadValue < projects?.length && (
                <div className='flex justify-center my-7 items-center '>
                  <div className='w-full flex justify-center py-6'>
                    <button
                      onClick={() => {
                        setLoadValue((value) => value + 5);
                      }}
                      className='primary-btn in-dark w-button lg:w-1/3'
                      style={{ textAlign: 'center' }}
                    >
                      show more
                    </button>
                  </div>
                </div>
              )}
              {projects &&
                loadValue > projects?.length &&
                projects.length > 10 && (
                  <div className='flex justify-center my-7 items-center '>
                    <div className='w-full flex justify-center py-6'>
                      <button
                        onClick={() => {
                          setLoadValue(5);
                        }}
                        className='primary-btn in-dark w-button lg:w-1/3'
                        style={{ textAlign: 'center' }}
                      >
                        show less
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
          <p className='text-primary mt-2 cursor-pointer underline w-fit ml-auto'>
            View More
          </p>

          <ReviewSection user_id={initFreelancer?.user_id} targetUser={initFreelancer} />
        </div>
      </div>
      {browsingUser && showMessageBox && (
        <ChatPopup
          {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }}
          showFreelancerProfile={true}
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
              window.location.href = `/freelancers/${freelancer.username}`;
            }}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            See Profile
          </button>
          <button
            onClick={() => (window.location.href = `/dashboard`)}
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

      <LoginPopup
        visible={showLoginPopup}
        setVisible={setShowLoginPopup}
        redirectUrl={`/freelancers/${initFreelancer.username}`}
      />

      <div
        className={`fixed top-28 z-10 transform duration-300 transition-all ${copied ? 'right-5' : '-right-full'
          }`}
      >
        <Alert severity='success'>{`${copied} Copied to clipboard`}</Alert>
      </div>
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
