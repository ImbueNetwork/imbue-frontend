import useMediaQuery from '@mui/material/useMediaQuery';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StreamChat, UserResponse } from 'stream-chat';
import {
  Channel,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  MessageSimple,
  RenderTextOptions,
  Thread,
  useChatContext,
  useMessageContext,
  Window,
} from 'stream-chat-react';
import { DefaultStreamChatGenerics } from 'stream-chat-react/dist/types/types';

import { CustomChannelHeader } from '../StreamChatComponents/CustomChannelHeader';

function DashboardChatBox({
  client,
}: {
  client: StreamChat;
}) {
  const mobileView = useMediaQuery('(max-width:500px)');
  const [channels, setChannels] = useState<any>([]);
  const [channel, setChannel] = useState<any>();
  const filters = client &&  { members: { $in: [String(client.user?.id)] } };
  const router = useRouter();

  useEffect(() => {
    if (router.query.chat && !channel) {
      router.query.chat = [];
      router.replace(router, undefined, { shallow: true });
    }
  }, [router.query.chat, channel, router]);

  const closeChat = () => {
    //for navigating back and front
    router.query.chat = [];
    router.replace(router, undefined, { shallow: true });
  };

  function CustomListContainer() {
    const { channel: channelContext, setActiveChannel } = useChatContext();

    const getUserName = (index: string) => {
      const array: any = Object.values(channels[index]?.state?.members);
      let username = 'Not Found';

      array?.forEach(function (key: any) {
        if (array.length === 2 && key.user_id !== client.userID) {
          username =
            key?.user?.name?.length > 22
              ? `${key?.user?.name?.substring(0, 22)}...`
              : key?.user?.name;
        }
      });
      return username;
    };

    const getLastMessage = (index: string) => {
      const messges = channels[index]?.state?.messageSets;
      const length = messges[0]?.messages.length || 0;
      const message = messges[0]?.messages[length - 1]?.text;
      return message?.length > 22 ? `${message?.substring(0, 22)}...` : message;
    };

    const handleChatClick = (selectedChannel: any) => {
      setChannel(selectedChannel);
      setActiveChannel(selectedChannel);

      //for navigating back and front
      router.query.chat = selectedChannel.id;
      router.push(router, undefined, { shallow: true });
    };

    return channels.length ? (
      <div className='str-chat__channel-list-messenger str-chat__channel-list-messenger-react'>
        <div className='str-chat__channel-list-messenger__main str-chat__channel-list-messenger-react__main'>
          {channels.map((mych: any, index: string) => (
            <button
              key={mych.cid}
              onClick={() => handleChatClick(mych)}
              className={`str-chat__channel-preview-messenger str-chat__channel-preview ${
                !mobileView &&
                mych.cid === channelContext?.cid &&
                'str-chat__channel-preview-messenger--active'
              }`}
            >
              <div className='str-chat__channel-preview-messenger--left'>
                <div className='str-chat__avatar str-chat__avatar--circle str-chat__message-sender-avatar'>
                  <Image
                    height={mobileView ? 30 : 40}
                    width={mobileView ? 30 : 40}
                    src={
                      mych.data.image ||
                      require('@/assets/images/profile-image.png')
                    }
                    alt=''
                    className='h-[30px] max-w-[30px] lg:h-[40px] lg:max-w-[40px] rounded-full object-cover'
                  />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[14px] lg:text-[16px] font-bold text-imbue-purple-dark'>
                  {getUserName(index)}
                </span>
                <span className='str-chat__channel-preview-messenger--last-message text-imbue-purple'>
                  {getLastMessage(index)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : (
      <></>
    );
  }

  function renderChannels(channels: any) {
    setChannels(channels);
    return <></>;
  }

  function customRenderText(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mentions_user: UserResponse<DefaultStreamChatGenerics>[] | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: RenderTextOptions | undefined
  ) {
    return <p className='text-base'>{text}</p>;
  }

  function customPinnedRenderText(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mentions_user: UserResponse<DefaultStreamChatGenerics>[] | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: RenderTextOptions | undefined
  ) {
    return (
      <div className='flex flex-col !space-x-2'>
        <p className='italic w-full flex text-xs  text-gray-500 flex-row-reverse'>
          Pinned
        </p>
        <p className='text-base'>{text} </p>
      </div>
    );
  }

  const CustomMessage = (props: any) => {
    const { message } = useMessageContext();

    if (message.pinned)
      return <MessageSimple {...props} renderText={customPinnedRenderText} />;
    return <MessageSimple {...props} renderText={customRenderText} />;
  };

  return (
    <div className='custom-chat-container relative w-full rounded-2xl h-[75vh] bg---theme-grey-dark border border-white border-opacity-25 overflow-hidden -mt-2'>
      <Chat client={client} theme='str-chat__theme-light'>
        {mobileView ? (
          <>
            {!router.query.chat ? (
              <div className='chat-list-container border-r border-r-white'>
                <ChannelList
                  renderChannels={renderChannels}
                  List={CustomListContainer}
                  filters={filters}
                  showChannelSearch={true}
                />
              </div>
            ) : (
              <Channel channel={channel}>
                <Window>
                  <CustomChannelHeader
                    showFreelancerProfile={false}
                    closeChat={closeChat}
                  />

                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            )}
          </>
        ) : (
          <div className='flex h-full'>
            <div className='chat-list-container border-r border-r-white'>
              <ChannelList
                // renderChannels={renderChannels}
                // List={CustomListContainer}
                filters={filters}
                showChannelSearch={true}
              />
            </div>
            <Channel Message={CustomMessage}>
              <Window>
                <CustomChannelHeader showFreelancerProfile={false} />
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

export default DashboardChatBox;
