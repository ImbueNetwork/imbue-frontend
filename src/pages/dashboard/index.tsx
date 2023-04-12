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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatPopup from "@/components/ChatPopup";
import { getFreelancerApplications } from "@/redux/services/freelancerService";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { BriefLists } from "@/components/Briefs/BriefsList";
import { useRouter } from "next/router";
import { ApplicationContainer } from "@/components/Briefs/ApplicationContainer";
import Login from "@/components/Login";

const timeAgo = new TimeAgo("en-US");

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
};

type FreelancerApplicationsType = {
  myApplications: any;
};

const Dashboard = ({ user, isAuthenticated }: DashboardProps): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(!isAuthenticated);

  const [client, setClient] = useState<StreamChat>();
  const filters = { members: { $in: [user?.username] } };
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [briefs, setBriefs] = useState<any>({});
  const [briefId, setBriefId] = useState<number | undefined>();
  const [applications, setApplications] = useState<any[]>([]);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Project[]>([]);

  const setup = async () => {
    if (user) {
      const myApplicationsResponse = await getFreelancerApplications(user?.id);
      setMyApplications(myApplicationsResponse);
      setBriefs(await getUserBriefs(user?.id));
    }
  };

  const getApplications = async (id: string | number) => {
    setBriefApplications(await getBriefApplications(id));
  };

  useEffect(() => {
    setup();
    if (briefId) {
      getApplications(briefId);
    }
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
    //TODO: redirect user to application
    // redirect(`briefs/${briefId}/applications/${applicationId}/`);
  };

  const setupStreamChat = async () => {
    setClient(await getStreamChat());
  };

  useEffect(() => {
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
            label={`Messages ${
              unreadMessages > 0 ? `(${unreadMessages})` : ""
            }`}
            value={2}
          />
          <BottomNavigationAction label="Freelancer View" value={3} />
        </BottomNavigation>
      </StyledEngineProvider>
      {selectedOption === 1 && (
        <div>
          {briefId ? (
            <div className="bg-[#2c2c2c] border border-solid border-[#ffffff40] relative rounded-[0.75rem] ">
              <div
                className="absolute top-2 left-2 cursor-pointer"
                onClick={() => setBriefId(undefined)}
              >
                <ArrowBackIcon />
              </div>
              {briefApplications?.map((application: any, index) => {
                return (
                  <ApplicationContainer
                    application={application}
                    handleMessageBoxClick={handleMessageBoxClick}
                    redirectToApplication={redirectToBriefApplications}
                    key={index}
                  />
                );
              })}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-3">Open Briefs</h2>
              <BriefLists
                briefs={briefs?.briefsUnderReview}
                setBriefId={setBriefId}
                showNewBriefButton={true}
              />
              <h2 className="text-xl font-bold mb-3 mt-10">Projects</h2>
              <BriefLists
                briefs={briefs?.acceptedBriefs}
                setBriefId={setBriefId}
              />
            </div>
          )}
        </div>
      )}
      {selectedOption === 2 && <ChatBox client={client} filters={filters} />}
      {selectedOption === 3 && (
        <MyFreelancerApplications myApplications={myApplications} />
      )}
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

export const MyFreelancerApplications = ({
  myApplications,
}: FreelancerApplicationsType): JSX.Element => {
  const router = useRouter();
  const redirectToApplication = (application: Project) => {
    //TODO: redirect
    router.push(
      `/briefs/${application.brief_id}/applications/${application.id}/`
    );
  };

  const redirectToDiscoverBriefs = () => {
    router.push(`/briefs`);
  };

  if (myApplications?.length === 0)
    return (
      <button
        onClick={() => {
          redirectToDiscoverBriefs();
        }}
        className="primary-btn in-dark w-button w-1/3"
        style={{ textAlign: "center" }}
      >
        Discover Briefs
      </button>
    );

  return (
    <div className="bg-[#2c2c2c] border border-solid border-[#ffffff40] relative rounded-[0.75rem] overflow-hidden">
      {myApplications.map((application: Project, index: number) => (
        <div
          key={index}
          onClick={() => redirectToApplication(application)}
          className="hover:bg-[#121c7f] h-56 border-b-[none] flex px-[2.5rem] py-[2rem] cursor-pointer gap-[2rem]"
        >
          <div className="w-4/5">
            <h3 className="text-xl font-bold mb-3">{application?.name}</h3>
          </div>
          <div className="flex flex-col justify-evenly items-center ml-auto">
            <span>{timeAgo.format(new Date(application?.created))}</span>
            <div
              className={`px-4 py-2 ${
                ProjectStatus[application.status_id]
              }-button w-fit rounded-full`}
            >
              {ProjectStatus[application.status_id]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

Dashboard.getInitialProps = async () => {
  const userResponse = await getCurrentUser();

  if (!userResponse) {
    return {
      isAuthenticated: false,
      user: undefined,
    };
  }

  return { isAuthenticated: true, user: userResponse };
};

export default Dashboard;
