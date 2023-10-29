/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

import { getStreamChat } from '@/utils';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';

import { AppContext, AppContextType } from '@/components/Layout';

import { Project, User } from '@/model';
import { Brief } from '@/model';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';

import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './new';

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
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);
  const router = useRouter();

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
        setClient(await getStreamChat());
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
        }
      });
    }
  }, [client, user?.getstream_token, user?.username, loadingStreamChat]);

  const { profileView } = useContext(AppContext) as AppContextType;

  if (loadingStreamChat || loadingUser) return <FullScreenLoader />;

  if (profileView === 'freelancer') return <FreelancerDashboard />;

  return client ? (
    <div className='px-[15px]'>
      <ClientDashboard />
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
