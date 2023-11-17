import { DefaultGenerics, FormatMessageResponse } from 'stream-chat';

import { store } from '@/redux/store/store';

export const setPinMessage = async (
  message: FormatMessageResponse<DefaultGenerics>
) => {
  const { client } = store.getState().userState;
  if (client) {
    await client.pinMessage(message);
  }
};

export const setUnPinMessage = async (
  message: FormatMessageResponse<DefaultGenerics>
) => {
  const { client } = store.getState().userState;
  if (client) {
    await client.unpinMessage(message);
  }
};

export const deleteMessage = async (
  message: FormatMessageResponse<DefaultGenerics>
) => {
  const { client } = store.getState().userState;
  if (client) {
    await client.deleteMessage(message.id);
  }
};
