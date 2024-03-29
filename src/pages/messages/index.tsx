import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { Channel, DefaultGenerics, UserResponse } from 'stream-chat';
import useOnClickOutside from 'use-onclickoutside';

import ChannelListItem from '@/components/ChannelListItem/ChannelListItem';
import FullScreenLoader from '@/components/FullScreenLoader';
import EmptyMessageBox from '@/components/MessageBox/EmptyMessageBox';
import MessageBox from '@/components/MessageBox/MessageBox';

import { RootState } from '@/redux/store/store';

export default function Messages() {
  const { user, loading, client } = useSelector(
    (state: RootState) => state.userState
  );
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [channels, setChannels] = useState<Channel<DefaultGenerics>[]>([]);
  const [searchUsers, setSearchUsers] = useState<UserResponse[]>([]);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [selectedChannel, setSelectedChannel] =
    useState<Channel<DefaultGenerics> | null>(null);

  const handleSelectedChannel = async (Selected: Channel) => {
    if (Selected.countUnread() > 0) {
      await Selected.markRead();
    }
    setSelectedChannel(Selected);
  };

  useEffect(() => {
    if (!user.id && !loading) {
      router.push('/');
    }
  }, [user, loading]);

  useOnClickOutside(searchRef, () => setSearchUsers([]));

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

    const getUnreadMessages = async () => {
      const count = await client.getUnreadCount();
      setUnreadMessages(count.total_unread_count);
    };

    getUnreadMessages();

    const myClientOn = client.on((event) => {
      if (event.total_unread_count !== undefined) {
        setUnreadMessages(event.total_unread_count);
      }
    });

    return () => {
      myClientOn.unsubscribe();
    };
  }, [client, user.id]);

  const onCreateChannel = async (item: UserResponse) => {
    const channel = client?.channel('messaging', {
      members: [String(user.id), item.id],
    });
    const res = await channel?.create();
    const resp = await client?.queryChannels({ id: res?.channel.id });
    if (resp) {
      setSearchUsers([]);
      setSelectedChannel(resp[0]);
      setChannels((item) => [resp[0], ...item]);
    }
  };
  const handleSearch = async (event: any) => {
    if (event.target.value) {
      const res = await client?.queryUsers(
        {
          name: { $autocomplete: event.target.value },
        },
        {},
        { limit: 10 }
      );
      if (res?.users) setSearchUsers(res?.users);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className='bg-white h-[83vh] flex   mt-5 px-2 py-2 rounded-3xl'>
      <div className='pl-5 pr-3   max-w-[18.25rem]   lg:max-w-[22.25rem] xl:max-w-[28.25rem]  w-full py-5 h-[78vh] overflow-auto'>
        <div className='text-black flex text-xl gap-2 items-center'>
          <p>Messages </p>
          <div className='text-sm bg-imbue-light-grey w-7 h-7 flex items-center justify-center  text-text-aux-colour  rounded-full'>
            {unreadMessages > 99 ? 99 + '+' : unreadMessages}
          </div>
        </div>
        <div
          ref={searchRef}
          className='flex relative items-center mb-7 border border-text-aux-colour text-black px-2 mt-3 rounded-md '
        >
          <AiOutlineSearch size={25} />
          <input
            onChange={handleSearch}
            placeholder='Search'
            className='py-2 px-1 placeholder:text-text-aux-colour w-full outline-none'
          />
          {searchUsers.length > 0 && (
            <div className='absolute w-full rounded-xl shadow-2xl bg-white z-10 top-12  py-5'>
              {searchUsers.map((user) => (
                <div
                  onClick={() => onCreateChannel(user)}
                  key={user.id}
                  className='py-2 flex items-center gap-3 cursor-pointer px-5 hover:bg-imbue-light-grey '
                >
                  <Image
                    className='w-11 h-11 rounded-full object-cover'
                    src={
                      user.profile_photo ||
                      require('@/assets/images/profile-image.png')
                    }
                    width={120}
                    height={120}
                    alt='user profile'
                  />
                  <p>{user.name}</p>
                </div>
              ))}
            </div>
          )}
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
