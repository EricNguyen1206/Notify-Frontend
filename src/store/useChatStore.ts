import { create } from 'zustand'

import { useAuthStore } from './useAuthStore'

interface Message {
  id: number
  text: string
  senderId: number
  receiverId?: number
  channelId?: number
  type: 'channel' | 'direct'
  createdAt: string
}

interface ChatState {
  channels: Record<string, Message[]>;
  fetchMessages: (channelId: number) => Promise<void>;
  sendMessage: (msg: Partial<Message>) => Promise<void>;
  addMessageToChannel: (channelId: string, msg: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channels: {},

  fetchMessages: async (channelId: number) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/chats/channel/${channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      set((state) => ({
        channels: {
          ...state.channels,
          [String(channelId)]: data,
        },
      }));
    }
  },

  sendMessage: async (msg: Partial<Message>) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/chats`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    const data = await res.json();
    if (res.ok && msg.channelId) {
      set((state) => ({
        channels: {
          ...state.channels,
          [String(msg.channelId)]: [
            ...(state.channels[String(msg.channelId)] || []),
            data,
          ],
        },
      }));
    }
  },

  addMessageToChannel: (channelId: string, msg: Message) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [channelId]: [...(state.channels[channelId] || []), msg],
      },
    })),
}));
