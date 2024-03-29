import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'stream-chat-react/dist/css/v2/index.css';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';

import { Modal } from '@mui/material';

import { AppContext, AppContextType } from '@/components/Layout';

import { Project, User } from '@/model';
import { Brief } from '@/model';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';

import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import WelcomForNewUser from './components/WelcomeForNewUser';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = (): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [newUser, setNewUser] = useState(false);
  const {
    user,
    loading: loadingUser,
    error: userError,
    client,
  } = useSelector((state: RootState) => state.userState);
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);
  const router = useRouter();

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  useEffect(() => {
    const entity = window.localStorage.getItem('newUser');
    if (entity) {
      setNewUser(true);
      window.localStorage.removeItem('newUser');
    }
  }, []);

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
  }, [loadingUser, router, user?.username]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
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
      <Modal open={newUser} className='flex justify-center items-center'>
        <WelcomForNewUser handleClose={setNewUser} />
      </Modal>
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
