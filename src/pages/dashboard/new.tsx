/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { StyledEngineProvider } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

import { fetchUser, getStreamChat } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import DashboardChatBox from '@/components/Dashboard/MyChatBox';
import MyClientBriefsView from '@/components/Dashboard/MyClientBriefsView';
import MyFreelancerApplications from '@/components/Dashboard/MyFreelancerApplications';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';

import { Freelancer, Project, User } from '@/model';
import { Brief } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';
import { BiRightArrowAlt } from 'react-icons/bi';
import { MdOutlineAttachMoney } from 'react-icons/md';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = ({ val }: { val?: string }): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [client, setClient] = useState<StreamChat>();
  const {
    user,
    loading: loadingUser,
    error: userError,
  } = useSelector((state: RootState) => state.userState);
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [myApplications, _setMyApplications] = useState<Project[]>();
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);

  const router = useRouter();
  const { briefId } = router.query;

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  const handleMessageBoxClick = async (
    user_id: number,
    _freelancer: Freelancer
  ) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  const redirectToBriefApplications = (applicationId: string) => {
    router.push(`/briefs/${briefId}/applications/${applicationId}`);
  };

  useEffect(() => {
    if (val === 'message') setSelectedOption(2);
  }, [val]);

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
        setClient(await getStreamChat());
        _setMyApplications(await getFreelancerApplications(user?.id));
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingStreamChat(false);
      }
    };

    setupStreamChat();
  }, [user]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
      client?.connectUser(
        {
          id: String(user.id),
          username: user.username,
          name: user.display_name,
        },
        user.getstream_token
      );
      const getUnreadMessageChannels = async () => {
        const result = await client.getUnreadCount();
        dispatch(setUnreadMessage({ message: result.channels.length }));
      };
      getUnreadMessageChannels();
      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          dispatch(setUnreadMessage({ message: event.unread_channels }));
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [client, user?.getstream_token, user?.username, loadingStreamChat]);

  if (loadingStreamChat || loadingUser) return <FullScreenLoader />;

  return client ? (
    <div className='bg-white  mt-2 py-7 px-5 rounded-3xl'>
      <>
        <p className='text-black text-[27px]'>
          Welcome , {user.display_name.split(' ')[0]} 👋
        </p>
        <p className='text-text-aux-colour text-sm'>
          Glad to have you on imbue
        </p>
      </>
      <div className='flex text-text-grey gap-7 mt-9'>
        <div className=' py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full max-w-[28.25rem]'>
          <div className='flex justify-between'>
            <p>Projects</p>
            <div className='flex  items-center gap-2  text-xs'>
              <p className='px-2 flex-grow-0 py-1 bg-white rounded-full'>
                ongoing
              </p>
              <p>Applied</p>
            </div>
          </div>
        </div>
        <div className=' py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full max-w-[28.25rem]'>
          <p>Grants</p>
        </div>
        <div className=' py-5 px-5 flex flex-col rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full max-w-[28.25rem]'>
          <div className='flex justify-between'>
            <p>Total Earnings</p>
            <div className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full'>
              <BiRightArrowAlt size={22} className='-rotate-45' />
            </div>
          </div>
          <div className='text-black mt-auto'>
            <div className='flex'>
              <MdOutlineAttachMoney size={23} />
              <p className='text-4xl font-semibold'>32,975.00</p>
            </div>
            <p className='text-text-grey'>Payout Accounts</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

export default Dashboard;
