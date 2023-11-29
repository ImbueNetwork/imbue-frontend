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

type typeLatesReaction = { val: string; user_ids: string[]; count: number };

export const sendMessageReaction = async (
  message: FormatMessageResponse,
  val: any
) => {
  const { client, user } = store.getState().userState;

  if (client && user?.id) {
    const reactions: typeLatesReaction[] =
      message.lates_reactions as typeLatesReaction[];
    if (reactions?.length > 0) {
      const isExit = reactions.findIndex((item) => item.val === val);
      if (isExit != -1) {
        if (reactions[isExit].user_ids.includes(String(user.id))) {
          if (reactions[isExit].count == 1) {
            reactions.splice(isExit, 1);
          } else {
            reactions[isExit].count = reactions[isExit].count - 1;
            reactions[isExit].user_ids = reactions[isExit].user_ids.filter(
              (id) => id != String(user.id)
            );
          }
        } else {
          reactions[isExit].count = reactions[isExit].count + 1;
          reactions[isExit].user_ids.push(String(user.id));
        }
        await client.partialUpdateMessage(message.id, {
          set: {
            lates_reactions: reactions,
          },
        });
        return;
      }

      await client.partialUpdateMessage(message.id, {
        set: {
          lates_reactions: [
            ...reactions,
            { val, user_ids: [String(user.id)], count: 1 },
          ],
        },
      });
      return;
    }

    await client.partialUpdateMessage(message.id, {
      set: {
        lates_reactions: [{ val, user_ids: [String(user.id)], count: 1 }],
      },
    });
  }
};
