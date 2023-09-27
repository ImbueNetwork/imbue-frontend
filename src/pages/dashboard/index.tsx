/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { StyledEngineProvider } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

import { fetchUser, getStreamChat } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import DashboardChatBox from '@/components/Dashboard/MyChatBox';
import MyClientBriefsView from '@/components/Dashboard/MyClientBriefsView';
import MyFreelancerApplications from '@/components/Dashboard/MyFreelancerApplications';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
const LoginPopup = dynamic(() => import("@/components/LoginPopup/LoginPopup"));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';

import { Freelancer, Project, User } from '@/model';
import { Brief } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = (): JSX.Element => {
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

      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [client, user?.getstream_token, user?.username, loadingStreamChat]);

  if (loadingStreamChat || loadingUser) return <FullScreenLoader />;

  return client ? (
    <div className='px-[15px]'>
      <StyledEngineProvider injectFirst>
        <BottomNavigation
          showLabels
          value={selectedOption}
          onChange={(event, newValue) => {
            setSelectedOption(newValue);
          }}
        >
          <BottomNavigationAction label='Client View' value={1} />
          <BottomNavigationAction
            label={`Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ''
              }`}
            value={2}
          />
          <BottomNavigationAction label='Freelancer View' value={3} />
        </BottomNavigation>
      </StyledEngineProvider>

      {selectedOption === 1 && (
        <MyClientBriefsView
          {...{
            user,
            briefId,
            handleMessageBoxClick,
            redirectToBriefApplications,
          }}
        />
      )}
      {selectedOption === 2 && (
        <DashboardChatBox client={client} />
      )}
      {selectedOption === 3 && (
        <MyFreelancerApplications
          user_id={user.id}
          myApplications={myApplications}
        />
      )}

      {user && showMessageBox && (
        <ChatPopup
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={user}
          showFreelancerProfile={true}
        />
      )}

      <LoginPopup
        visible={loginModal}
        setVisible={setLoginModal}
        redirectUrl='/dashboard'
      />

      <ErrorScreen error={error} setError={setError}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Log In
          </button>
        </div>
      </ErrorScreen>
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

// export const getServerSideProps = async (context: any) => {
//   const { req, res } = context;
//   try {
//     // const user: any = await authenticate('jwt', req, res);
//     if (user) {
//       const myBriefs = await getUserBriefs(user?.id);
//       const myApplicationsResponse = await getFreelancerApplications(user?.id);
//       return {
//         props: {
//           isAuthenticated: true,
//           user,
//           myBriefs,
//           myApplicationsResponse,
//         },
//       };
//     }
//   } catch (error: any) {
//     console.error(error);
//   }
//   return {
//     redirect: {
//       destination: '/',
//       permanent: false,
//     },
//   };
// };

export default Dashboard;
