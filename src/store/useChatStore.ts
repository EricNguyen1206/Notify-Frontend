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
  messages: Message[]
  fetchMessages: (channelId: number) => Promise<void>
  sendMessage: (msg: Partial<Message>) => Promise<void>
  addMessage: (msg: Message) => void // dùng cho realtime
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  fetchMessages: async (channelId) => {
    const token = useAuthStore.getState().token
    const res = await fetch(`/chats/channel/${channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (res.ok) set({ messages: data })
  },

  sendMessage: async (msg) => {
    const token = useAuthStore.getState().token
    const res = await fetch(`/chats`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
    const data = await res.json()
    if (res.ok) {
      set((state) => ({ messages: [...state.messages, data] }))
    }
  },

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}))
