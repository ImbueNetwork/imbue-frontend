import { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { Channel, DefaultGenerics } from 'stream-chat';

import ChannelListItem from '@/components/ChannelListItem/ChannelListItem';
import EmptyMessageBox from '@/components/MessageBox/EmptyMessageBox';
import MessageBox from '@/components/MessageBox/MessageBox';

import { RootState } from '@/redux/store/store';

export default function Messages() {
  const { user, client } = useSelector((state: RootState) => state.userState);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [channels, setChannels] = useState<Channel<DefaultGenerics>[]>([]);
  const [selectedChannel, setSelectedChannel] =
    useState<Channel<DefaultGenerics> | null>(null);

  const handleSelectedChannel = async (Selected: Channel) => {
    if (Selected.countUnread() > 0) {
      await Selected.markRead();
    }
    setSelectedChannel(Selected);
  };

  const getChannel = async () => {
    if (!client) return;
    const filter = {
      type: 'messaging',
      members: { $in: [String(user.id)] },
    };
    const sort: any = { last_message_at: -1 };
    const channels = await client.queryChannels(filter, sort, {
      watch: true, // this is the default
      state: true,
    });

    setChannels(channels);
  };

  useEffect(() => {
    if (!client) return;
    getChannel();

    const myClientOn = client.on((event) => {
      if (event.total_unread_count !== undefined) {
        setUnreadMessages(event.total_unread_count);
      }
    });

    return () => {
      myClientOn.unsubscribe();
    };
  }, [client, user.id]);

  return (
    <div className='bg-white h-[83vh] flex   mt-5 px-2 py-2 rounded-3xl'>
      <div className='pl-5 pr-3 min-w-[28.25rem] max-w-[28.25rem] py-5 h-[78vh] overflow-auto'>
        <p className='text-black text-xl'>
          Messages{' '}
          <span className='text-sm bg-imbue-light-grey px-1 py-0.5 text-text-aux-colour rounded-full'>
            {unreadMessages}
          </span>
        </p>
        <div className='flex items-center mb-7 border border-text-aux-colour text-black px-2 mt-3 rounded-md '>
          <AiOutlineSearch size={25} />
          <input
            placeholder='Search'
            className='py-2 px-1 placeholder:text-text-aux-colour w-full outline-none'
          />
        </div>
        {channels.map((item: Channel<DefaultGenerics>) => (
          <ChannelListItem
            setChannel={handleSelectedChannel}
            key={item.cid}
            handleChannelState={getChannel}
            channel={item}
            selectedChannel={selectedChannel}
          />
        ))}
      </div>
      <div className='w-full rounded-3xl  bg-imbue-light-grey'>
        {!selectedChannel && <EmptyMessageBox />}
        {selectedChannel && client && <MessageBox channel={selectedChannel} />}
      </div>
    </div>
  );
}
