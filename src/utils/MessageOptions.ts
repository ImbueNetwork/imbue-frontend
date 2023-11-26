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

export const flagMessages = async (
  message: FormatMessageResponse<DefaultGenerics>
) => {
  const { client } = store.getState().userState;
  if (client) {
    await client.flagMessage(message.id);
  }
};

export const sendMessageReaction = async (
  message: FormatMessageResponse,
  val: any
) => {
  const { client, user } = store.getState().userState;
  if (client && user?.id) {
    await client.partialUpdateMessage(message.id, {
      set: {
        latest_reactions: [{ val, user, user_ids: [user.id] }],
      },
    });
  }
};
