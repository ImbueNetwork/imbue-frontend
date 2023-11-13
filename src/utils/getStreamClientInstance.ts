import { StreamChat } from 'stream-chat';

import { store } from '@/redux/store/store';

import { getStreamChat } from '.';

let getStreamClient: StreamChat | null = null;
const createClient = async () => {
  const { user, loading } = store.getState().userState;
  const client = await getStreamChat();
  if (user && user.id && loading) {
    client?.connectUser(
      {
        id: String(user.id),
        username: user.username,
        name: user.display_name,
      },
      user.getstream_token
    );
    return client;
  }
  return null;
};

export const getGetStreamClient = async () => {
  if (getStreamClient) {
    return getStreamClient;
  }
  getStreamClient = await createClient();
  return getStreamClient;
};
