import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StreamChat } from 'stream-chat';

import { getStreamChat } from '@/utils';

import DashboardChatBox from '@/components/Dashboard/MyChatBox';
import FullScreenLoader from '@/components/FullScreenLoader';

import { RootState } from '@/redux/store/store';

export default function Messages() {
  const {
    user,
    loading: loadingUser,
    error: userError,
  } = useSelector((state: RootState) => state.userState);
  const router = useRouter();
  const [client, setClient] = useState<StreamChat>();
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);
  const [error, setError] = useState<any>(userError);

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
        setClient(await getStreamChat());
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingStreamChat(false);
      }
    };
    setupStreamChat();
  }, [user.id]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
      client?.connectUser(
        {
          id: String(user.id),
          username: user.username,
          name: user.display_name,
        },
        user.getstream_token
      );
    }
  }, [user, client]);

  if (loadingStreamChat || loadingUser || !client) {
    return <FullScreenLoader />;
  }

  if (error) {
    router.push('/');
  }

  return (
    <>
      <DashboardChatBox client={client} />
    </>
  );
}
