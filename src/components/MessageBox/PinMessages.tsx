import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Channel, GetRepliesAPIResponse } from 'stream-chat';

import { RootState } from '@/redux/store/store';

import MessageItem from './MessageItem';

export default function PinMessages({
  channel,
  handleReplayMessage,
}: {
  handleReplayMessage: any;
  channel: Channel;
}) {
  const { user } = useSelector((state: RootState) => state.userState);
  const [pinedmessage, setPinnedMessage] = useState<GetRepliesAPIResponse>();
  useEffect(() => {
    const getPinMessage = async () => {
      const res = await channel.getPinnedMessages({ limit: 100 });
      setPinnedMessage(res);
    };

    getPinMessage();
  }, [channel]);
  return (
    <div className='h-full overflow-auto bg-imbue-light-grey px-2 py-7'>
      {pinedmessage?.messages.map((item) => (
        <MessageItem
          key={item.id}
          message={item}
          handleReplayMessage={handleReplayMessage}
          showProfile
          user={user}
        />
      ))}
    </div>
  );
}
