/* eslint-disable unused-imports/no-unused-vars */
import { Badge } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BiChevronDown, BiRightArrowAlt } from 'react-icons/bi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-slick';
import { Channel, DefaultGenerics } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { fetchUser } from '@/utils';

import AreaGrah from '@/components/AreaGraph';
import ChatPopup from '@/components/ChatPopup';
import BriefsView from '@/components/Dashboard/V2/BriefsView';
import FullScreenLoader from '@/components/FullScreenLoader';
import { AppContext, AppContextType } from '@/components/Layout';
import MessageComponent from '@/components/MessageComponent';

import { Project, User } from '@/model';
import { Brief } from '@/model';
import { getUserAnalytics } from '@/redux/services/briefService';
import {
  getFreelancerApplications,
  getFreelancerProfile,
} from '@/redux/services/freelancerService';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';
export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

export type userAnalyticsType = {
  label: string;
  value: number;
};

const FreelancerDashboard = (): JSX.Element => {
  const {
    user,
    loading: loadingUser,
    error: userError,
    client,
  } = useSelector((state: RootState) => state.userState);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);
  const [userAnalytics, setUserAnalytics] = useState<userAnalyticsType[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [messageList, setMessageList] = useState<
    Channel<DefaultGenerics>[] | null
  >();

  const router = useRouter();

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  const handleMessageBoxClick = async (user_id: number) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  const { setProfileMode } = useContext(AppContext) as AppContextType;

  useEffect(() => {
    setLoadingStreamChat(true);

    const checkFreelancerProfile = async () => {
      try {
        const freelancer = await getFreelancerProfile(user?.username);
        if (!freelancer?.id) {
          setProfileMode('client');
          router.push('/freelancers/new');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      } finally {
        setLoadingStreamChat(false);
      }
    };
    checkFreelancerProfile();
  }, [loadingUser, router, setProfileMode, user?.username]);

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingStreamChat(false);
      }
    };

    setupStreamChat();
  }, [loadingUser, router, user?.id, user?.username]);

  useEffect(() => {
    const getUserAnalyt = async () => {
      const resp = await getUserAnalytics(user.id);
      const key = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      let totalViews = 0;
      const data = key.map((item: string) => {
        totalViews += resp?.analytics[item]?.count;
        return {
          label: item,
          value: resp?.analytics[item]?.count,
        };
      });
      setTotalViews(totalViews);
      setUserAnalytics(data);
    };
    if (user && user.id) {
      getUserAnalyt();
    }
  }, [user]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
      const getUnreadMessageChannels = async () => {
        const result = await client.getUnreadCount();
        dispatch(setUnreadMessage({ message: result.channels.length }));
      };

      const getChannel = async () => {
        const filter = {
          type: 'messaging',
          members: { $in: [String(user.id)] },
        };
        const sort: any = { last_message_at: -1 };
        const channels = await client.queryChannels(filter, sort, {
          limit: 4,
          watch: true, // this is the default
          state: true,
        });
        setMessageList(channels);
      };
      getUnreadMessageChannels();
      getChannel();
      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          getChannel();
          dispatch(setUnreadMessage({ message: event.unread_channels }));
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [
    client,
    user.getstream_token,
    user?.username,
    loadingStreamChat,
    user.id,
    dispatch,
  ]);

  const [applications, setApplciations] = useState<Project[]>([]);

  const completedProjects = applications.filter(
    (app) => app.completed === true
  );

  const totalEarnings = useMemo(() => {
    const initValue = 0;
    const total = completedProjects.reduce(
      (acc, curr) => acc + Number(curr.total_cost_without_fee),
      initValue
    );
    return total;
  }, [completedProjects]);

  const activeProjects = applications.filter(
    (app) => app.completed === false && app.chain_project_id && app.brief_id
  );
  const pendingProjects = applications.filter((app) => app.status_id === 1);
  const grants = applications.filter(
    (app) => !app.brief_id && app.chain_project_id
  );

  useEffect(() => {
    const getProjects = async () => {
      const applications = await getFreelancerApplications(user.id);

      setApplciations(applications);
    };

    if (user?.id) getProjects();
  }, [user?.id]);

  const options = [
    { name: 'Approved', bg: 'bg-[#90DB00]', status_id: 4 },
    { name: 'Pending', bg: 'bg-[#FF7A00]', status_id: 1 },
    { name: 'Changes Required', bg: 'bg-[#3B27C1]', status_id: 2 },
    { name: 'Rejected', bg: 'bg-[#FF7A00]', status_id: 3 },
  ];

  const [selectedOption, setSelectedOption] = useState<(typeof options)[0]>(
    options[0]
  );
  const [openedOption, setOpenedOption] = useState<boolean>(false);
  const [filteredApplications, setFilteredApplications] = useState<Project[]>();

  useEffect(() => {
    const getProjects = async () => {
      // setLoading(true)

      try {
        const Briefs = await getFreelancerApplications(user.id);

        const projectRes = Briefs.filter(
          (item) =>
            item.status_id == selectedOption.status_id && !item.chain_project_id
        );
        setFilteredApplications(projectRes);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      } finally {
        // setLoading(false)
      }
    };

    if (user?.id) getProjects();
  }, [selectedOption.status_id, user?.id]);

  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    dots: true,
    infinite: false,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    dotsClass: 'dashboard_slider',
    responsive: [
      {
        breakpoint: 860,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          variableWidth: true,
        }
      },
    ]
  }


  if (loadingStreamChat || loadingUser) return <FullScreenLoader />;

  return client ? (
    <div className='bg-white  mt-2 py-7 px-5 rounded-3xl'>
      <>
        <p className='text-black text-[27px]'>
          Welcome, {user?.display_name?.split(' ')[0]} 👋
        </p>
        <p className='text-text-aux-colour text-sm'>
          Glad to have you on imbue
        </p>
      </>
      {/* starting of the box sections */}

      <Slider className='w-full text-text-grey mt-9' ref={sliderRef} {...settings}>
        <div className='pr-7'>
          <div className='py-5 px-5 rounded-[18px] bg-imbue-light-grey w-[250px] lg:w-full'>
            <div className='flex justify-between items-center'>
              <p>Projects</p>
              <p
                className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full cursor-pointer'
                onClick={() => router.push('/projects/myprojects')}
              >
                View all
              </p>
            </div>
            <div className='mt-5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1  rounded-full bg-imbue-coral' />
                <p className='text-sm min-w-fit '>Completed Projects</p>
                <hr className='w-full border-dashed mt-3  border-imbue-coral ' />
                <p className='text-[22px] font-semibold text-black'>
                  {completedProjects?.length || 0}
                </p>
              </div>
            </div>
            <div className='mt-0.5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1 rounded-full bg-imbue-purple' />
                <p className='text-sm min-w-fit '>Active Projects</p>
                <hr className='w-full border-dashed mt-3  border-imbue-purple ' />
                <p className='text-[22px] font-semibold text-black'>
                  {activeProjects?.length || 0}
                </p>
              </div>
            </div>
            <div className='mt-0.5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1 rounded-full bg-imbue-coral' />
                <p className='text-sm min-w-fit'>Pending Projects</p>
                <hr className='w-full border-dashed mt-3  border-t-imbue-coral ' />
                <p className='text-[22px] font-semibold text-black'>
                  {pendingProjects?.length || 0}
                </p>
              </div>
            </div>
            <div className='mt-0.5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1 rounded-full bg-imbue-lemon' />
                <p className='text-sm min-w-fit '>Grants</p>
                <hr className='w-full border-dashed mt-3  border-imbue-lemon ' />
                <p className='text-[22px] font-semibold text-black'>
                  {grants?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='py-5 px-5 !flex flex-col justify-between rounded-[18px] bg-imbue-light-grey h-full  w-full text-text-grey min-h-[210px]'>
          <div className='flex justify-between items-center gap-3'>
            <p>Briefs</p>
            <div className='relative lg:w-44 select-none'>
              <div
                className='flex bg-white p-2 rounded-md gap-1.5 items-center cursor-pointer'
                onClick={() => setOpenedOption((prev) => !prev)}
              >
                <div className={`${selectedOption.bg} w-1 h-1 rounded-full`} />{' '}
                <p className='text-black text-sm'>{selectedOption.name}</p>
                <BiChevronDown
                  className={`ml-auto ${openedOption && 'rotate-180'} `}
                  color='black'
                  size={18}
                />
              </div>

              <div
                className={`${!openedOption && 'hidden'
                  } absolute z-[1] w-full rounded-md`}
              >
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 cursor-pointer ${option.status_id === selectedOption.status_id ? 'bg-imbue-light-purple': "bg-white"}`}
                    onClick={() => {
                      setSelectedOption(option);
                      setOpenedOption(false);
                    }}
                  >
                    <div className={`${option.bg} w-1 h-1 rounded-full`}></div>
                    <p className='text-sm'>{option.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className='mb-2 flex'>
              <p className='text-4xl font-semibold text-black'>
                {filteredApplications?.length || 0}
              </p>
            </div>
            <div className='flex gap-4 items-center justify-between'>
              <p>{selectedOption.name} brief</p>
              <div
                className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full cursor-pointer'
                onClick={() =>
                  router.push(
                    `/projects/applications?status_id=${selectedOption.status_id}`
                  )
                }
              >
                <BiRightArrowAlt size={22} className='-rotate-45' />
              </div>
            </div>
          </div>
        </div>

        <div className='pl-7'>
          <div className='py-5 px-5 flex flex-col rounded-[18px] tegr bg-imbue-light-grey  w-full min-h-[234px]'>
            <div className='flex justify-between'>
              <p>Total Earnings</p>
              <div
                onClick={() => router.push('/relay')}
                className='px-3 ml-3 py-0.5 border cursor-pointer text-black border-text-aux-colour rounded-full'
              >
                <BiRightArrowAlt size={22} className='-rotate-45' />
              </div>
            </div>
            <div className='text-black mt-auto'>
              <div className='flex items-center'>
                <MdOutlineAttachMoney size={23} />
                <p className='text-4xl font-semibold'>{totalEarnings}</p>
              </div>
              <p className='text-text-grey'>Payout Accounts</p>
            </div>
          </div>
        </div>
      </Slider>
      {/* ending of the box sections */}

      <div className='mt-9 flex flex-col-reverse lg:flex-row w-full gap-7'>
        <BriefsView
          {...{
            setError,
            currentUser: user,
          }}
        />
        <div className='lg:max-w-[25%] w-full rounded-md'>
          {/* Starting of graph */}
          <div className='bg-imbue-light-grey px-0.5 rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-7 px-7'>
              <p className='text-[#747474]'>Analytics</p>
              <p className='text-[#747474]'>{totalViews} views</p>
            </div>
            <div className='bg-white rounded-3xl relative '>
              <AreaGrah userInfo={userAnalytics} />
            </div>
          </div>
          {/* End of graph */}
          <div className='bg-imbue-light-grey px-0.5 mt-20  rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-4 px-7'>
              <Badge badgeContent={unreadMessages} color='error'>
                <p className='text-[#747474]'>Messaging</p>
              </Badge>
              <div
                className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full cursor-pointer'
                onClick={() => router.push('/dashboard/messages')}
              >
                <BiRightArrowAlt size={22} className='-rotate-45' />
              </div>
            </div>
            <div className=' bg-white py-3 rounded-3xl'>
              {messageList?.map((item, index) => (
                <MessageComponent
                  handleMessageClick={handleMessageBoxClick}
                  key={'message-component' + index}
                  props={item}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {user && showMessageBox && (
        <ChatPopup
          {...{
            showMessageBox,
            setShowMessageBox,
            browsingUser: user,
            targetUser,
          }}
          showFreelancerProfile={false}
        />
      )}
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

export default FreelancerDashboard;
