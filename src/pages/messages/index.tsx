import { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { Channel, DefaultGenerics, StreamChat } from 'stream-chat';

import { getGetStreamClient } from '@/utils/getStreamClientInstance';

import ChannelListItem from '@/components/ChannelListItem/ChannelListItem';
import EmptyMessageBox from '@/components/MessageBox/EmptyMessageBox';
import MessageBox from '@/components/MessageBox/MessageBox';

import { RootState } from '@/redux/store/store';

export default function Messages() {
  const { user, loading } = useSelector((state: RootState) => state.userState);
  const [client, setClient] = useState<StreamChat>();
  const [channels, setChannels] = useState<Channel<DefaultGenerics>[]>([]);
  const [selectedChannel, setSelectedChannel] =
    useState<Channel<DefaultGenerics> | null>(null);
  useEffect(() => {
    const getClient = async () => {
      const client = await getGetStreamClient();
      if (client) setClient(client);
    };
    getClient();
  }, [user, loading]);

  useEffect(() => {
    if (!client) return;
    const getChannel = async () => {
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
    getChannel();
    client.on((event) => {
      if (event.total_unread_count !== undefined) {
        getChannel();
      }
    });
  }, [client, user.id]);

  return (
    <div className='bg-white h-[83vh] flex   mt-5 px-2 py-2 rounded-3xl'>
      <div className='pl-5 pr-3 min-w-[25.25rem] py-5 h-[78vh] overflow-auto'>
        <p className='text-black text-xl'>Messages</p>
        <div className='flex items-center mb-7 border border-text-aux-colour text-black px-2 mt-3 rounded-md '>
          <AiOutlineSearch size={25} />
          <input
            placeholder='Search'
            className='py-2 px-1 placeholder:text-text-aux-colour w-full outline-none'
          />
        </div>
        {channels.map((item: Channel<DefaultGenerics>) => (
          <ChannelListItem
            setChannel={setSelectedChannel}
            key={item.cid}
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
