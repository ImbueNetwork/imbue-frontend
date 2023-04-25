/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Freelancer, Project, OffchainProjectState, User } from '@/model';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelList, MessageInput, MessageList, Thread, Window, useChannelStateContext, useChatContext } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { fetchUser, getCurrentUser, getStreamChat } from '@/utils';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BottomNavigation from '@mui/material/BottomNavigation';
import { StyledEngineProvider } from '@mui/material/styles';
import { getBriefApplications, getUserBriefs } from '@/redux/services/briefService';
import { CustomChannelHeader } from '@/components/Chat';
import ChatPopup from '@/components/ChatPopup';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { useRouter } from 'next/router';
import Login from '@/components/Login';
import { getServerSideProps } from '@/utils/serverSideProps';
import MyFreelancerApplications from '@/components/Dashboard/MyFreelancerApplications';
import MyClientBriefsView from '@/components/Dashboard/MyClientBriefsView';
import useMediaQuery from '@mui/material/useMediaQuery';
import Image from 'next/image';
import { channel } from 'diagnostics_channel';

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

  const router = useRouter();

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
    <div className="lg:-mt-8 hq-layout">
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

      {selectedOption === 1 && <MyClientBriefsView {...{ briefs, briefId, setBriefId, briefApplications, handleMessageBoxClick, redirectToBriefApplications }} />}
      {selectedOption === 2 && <ChatBox client={client} filters={filters} />}
      {selectedOption === 3 && <MyFreelancerApplications myApplications={myApplications} />}

      {user && showMessageBox && <ChatPopup showMessageBox={showMessageBox} setShowMessageBox={setShowMessageBox} targetUser={targetUser} browsingUser={user} />}

      <Login visible={loginModal} setVisible={setLoginModal} redirectUrl="/dashboard" />
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

function ChatBox({ client, filters }: { client: StreamChat; filters: object }) {
  const mobileView = useMediaQuery('(max-width:500px)');
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [channels, setChannels] = useState<any>([]);
  const [channel, setChannel] = useState<any>();

  console.log(showChatList);

  function CustomListContainer() {

    const getUserName = (index: string) => {
      const array: any = Object.values(channels[index]?.state?.members)
      const fullUsername = array[0].user.name
      let username = "Not Found"
      if (fullUsername) {
        username = fullUsername.length > 22 ? `${fullUsername?.substring(0, 22)}...` : fullUsername
      }
      return username
    }

    const getLastMessage = (index: string) => {
      const messges = channels[index]?.state?.messageSets
      const length = messges[0]?.messages.length || 0
      const message = messges[0]?.messages[length - 1]?.text

      return message?.length > 22 ? `${message?.substring(0, 22)}...` : message
    }

    return channels.length ? (
      <div className=''>
        {channels.map((mych: any, index: string) => (
          <button
            key={mych.cid}
            onClick={() => {
              setChannel(mych);
              setShowChatList(false);
            }}
            className="str-chat__channel-preview-messenger str-chat__channel-preview">
            <div className="str-chat__channel-preview-messenger--left">
              <div className="str-chat__avatar str-chat__avatar--circle str-chat__message-sender-avatar">
                <Image
                  height={30}
                  width={30}
                  src={mych.data.image || require('@/assets/images/profile-image.png')}
                  alt=""
                  className='rounded-full object-cover'
                />
              </div>
            </div>
            <div className="text-white flex flex-col">
              <span className='text-[14px]'>{getUserName(index)}</span>
              <span className='str-chat__channel-preview-messenger--last-message'>{getLastMessage(index)}</span>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <></>
    );
  }

  function renderChannels(channels: any, channelPreview: any) {
    setChannels(channels);
    return <></>;
  }

  return (
    <div className="custom-chat-container w-full rounded-2xl h-[75vh] bg---theme-grey-dark border border-white border-opacity-25 overflow-hidden">
      <Chat client={client} theme="str-chat__theme-dark">
        {mobileView ? (
          <>
            {showChatList ? (
              <div className="chat-list-container border-r border-r-white">
                <ChannelList renderChannels={renderChannels} List={CustomListContainer} filters={filters} showChannelSearch={true} />
              </div>
            ) : (
              <Channel channel={channel}>
                <Window>
                  <CustomChannelHeader setShowChatList={setShowChatList} />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            )}
          </>
        ) : (
          <div className="flex h-full">
            <div className="chat-list-container border-r border-r-white">
              <ChannelList filters={filters} showChannelSearch={true} />
            </div>
            <Channel>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        )}
      </Chat>
    </div>
  );
}

export { getServerSideProps };

export default Dashboard;
