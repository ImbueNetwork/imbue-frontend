/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Freelancer, Project, ProjectStatus, User } from "@/model";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { fetchUser, getCurrentUser, getStreamChat } from "@/utils";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import BottomNavigation from "@mui/material/BottomNavigation";
import { StyledEngineProvider } from "@mui/material/styles";
import {
  getBriefApplications,
  getUserBriefs,
} from "@/redux/services/briefService";
import { CustomChannelHeader } from "@/components/Chat";
import ChatPopup from "@/components/ChatPopup";
import { getFreelancerApplications } from "@/redux/services/freelancerService";
import { useRouter } from "next/router";
import Login from "@/components/Login";
import { getServerSideProps } from "@/utils/serverSideProps";
import MyFreelancerApplications from "@/components/Dashboard/MyFreelancerApplications";
import MyClientBriefsView from "@/components/Dashboard/MyClientBriefsView";

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
};

const Dashboard = ({ user, isAuthenticated }: DashboardProps): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(!isAuthenticated);
  const [client, setClient] = useState<StreamChat>();
  const filters = { members: { $in: [user?.username] } };
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [briefs, setBriefs] = useState<any>({});
  const [briefId, setBriefId] = useState<number | undefined>();
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Project[]>([]);

  const router = useRouter()

  const getApplications = async (id: string | number) => {
    setBriefApplications(await getBriefApplications(id));
  };

  useEffect(() => {
    const setup = async () => {
      if (user) {
        const myApplicationsResponse = await getFreelancerApplications(user?.id);
        setMyApplications(myApplicationsResponse);
        setBriefs(await getUserBriefs(user?.id));
      }
    };
    setup();
    briefId && getApplications(briefId);
  }, [briefId, user]);

  const handleMessageBoxClick = async (
    user_id: number,
    freelancer: Freelancer
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
    router.push(`/briefs/${briefId}/applications/${applicationId}`)
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
    <div className="-mt-8">
      <StyledEngineProvider injectFirst>
        <BottomNavigation
          showLabels
          value={selectedOption}
          onChange={(event, newValue) => {
            setSelectedOption(newValue);
          }}
        >
          <BottomNavigationAction label="Client View" value={1} />
          <BottomNavigationAction
            label={`Messages ${unreadMessages > 0 ? `(${unreadMessages})` : ""
              }`}
            value={2}
          />
          <BottomNavigationAction label="Freelancer View" value={3} />
        </BottomNavigation>
      </StyledEngineProvider>

      {selectedOption === 1 && <MyClientBriefsView {...{ briefs, briefId, setBriefId,briefApplications,handleMessageBoxClick,redirectToBriefApplications }} />}
      {selectedOption === 2 && <ChatBox client={client} filters={filters} />}
      {selectedOption === 3 && <MyFreelancerApplications myApplications={myApplications} />}

      {user && showMessageBox && (
        <ChatPopup
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={user}
        />
      )}

      <Login
        visible={loginModal}
        setVisible={setLoginModal}
        redirectUrl="/dashboard"
      />
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

function ChatBox({ client, filters }: { client: StreamChat; filters: object }) {
  return (
    <div className="custom-chat-container w-full rounded-2xl h-[75vh] bg---theme-grey-dark border border-white border-opacity-25 overflow-hidden">
      <Chat client={client} theme="str-chat__theme-dark">
        <div className="flex h-full">
          <div className="chat-list-container border-r border-r-white">
            <ChannelList filters={filters} showChannelSearch={true} />
          </div>
          <Channel>
            <Window>
              <CustomChannelHeader />
              {/* <ChannelHeader/> */}
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </div>
      </Chat>
    </div>
  );
}

export { getServerSideProps };

export default Dashboard;
