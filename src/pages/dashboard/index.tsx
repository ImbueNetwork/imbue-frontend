/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Freelancer, Project, OffchainProjectState, User } from '@/model';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import { fetchUser, getCurrentUser, getStreamChat } from '@/utils';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BottomNavigation from '@mui/material/BottomNavigation';
import { StyledEngineProvider } from '@mui/material/styles';
import { getBriefApplications, getUserBriefs } from '@/redux/services/briefService';
import ChatPopup from '@/components/ChatPopup';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { useRouter } from 'next/router';
import Login from '@/components/Login';
import { authenticate } from "@/pages/api/info/user";
import MyFreelancerApplications from '@/components/Dashboard/MyFreelancerApplications';
import MyClientBriefsView from '@/components/Dashboard/MyClientBriefsView';
import DashboardChatBox from '@/components/Dashboard/MyChatBox';
import { Brief } from '@/model';
import { ApplicationData } from '@/model';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = ({ user, isAuthenticated, myBriefs, myApplicationsResponse  }: DashboardProps): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(!isAuthenticated);
  const [client, setClient] = useState<StreamChat>();
  const filters = { members: { $in: [user?.username] } };
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [briefs, setBriefs] = useState<any>(myBriefs);
  // const [briefId, setBriefId] = useState<number | undefined>();
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Project[]>(myApplicationsResponse);

  const router = useRouter();  

  const {briefId} = router.query

  useEffect(() => {
    const getApplications = async (id: string | number) => {
      setBriefApplications(await getBriefApplications(id));
    };
    
    briefId && getApplications(briefId.toString());
  }, [briefId, user]);

  const handleMessageBoxClick = async (user_id: number, freelancer: Freelancer) => {
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
      setClient(await getStreamChat());
    };
    setupStreamChat();
  }, []);

  useEffect(() => {
    if (client && user) {
      client.connectUser(
        {
          id: user.username,
          name: user.username,
        },
        user.getstream_token
      );

      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [client, user?.getstream_token, user?.username]);

  return client ? (
    <div className="lg:-mt-8 hq-layout px-[15px]">
      <StyledEngineProvider injectFirst>
        <BottomNavigation
          showLabels
          value={selectedOption}
          onChange={(event, newValue) => {
            setSelectedOption(newValue);
          }}>
          <BottomNavigationAction label="Client View" value={1} />
          <BottomNavigationAction label={`Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ''}`} value={2} />
          <BottomNavigationAction label="Freelancer View" value={3} />
        </BottomNavigation>
      </StyledEngineProvider>

      {selectedOption === 1 && <MyClientBriefsView {...{ briefs, briefId, briefApplications, handleMessageBoxClick, redirectToBriefApplications }} />}
      {selectedOption === 2 && <DashboardChatBox client={client} filters={filters} />}
      {selectedOption === 3 && <MyFreelancerApplications myApplications={myApplications} />}

      {user && showMessageBox && <ChatPopup showMessageBox={showMessageBox} setShowMessageBox={setShowMessageBox} targetUser={targetUser} browsingUser={user} />}

      <Login visible={loginModal} setVisible={setLoginModal} redirectUrl="/dashboard" />
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

export const getServerSideProps = async (context: any) => {
  const { req, res } = context;
  try {
    const user:any = await authenticate("jwt", req, res);
    if (user) {
      const myBriefs = await getUserBriefs(user?.id)
      const myApplicationsResponse = await getFreelancerApplications(user?.id);
      return { props: { 
        isAuthenticated: true, 
        user,
        myBriefs,
        myApplicationsResponse 
      } };
    }
  } catch (error: any) {
    console.error(error);
  }
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};

export default Dashboard;
