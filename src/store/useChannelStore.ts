import { create } from 'zustand'

import { useAuthStore } from './useAuthStore'

interface Channel {
    id: number
    name: string
    ownerId: number
    createdAt: string
  }

  interface ChannelState {
    channels: Channel[]
    currentChannel: Channel | null
    fetchChannels: () => Promise<void>
    createChannel: (name: string) => Promise<void>
    setCurrentChannel: (channel: Channel) => void
  }

  export const useChannelStore = create<ChannelState>((set) => ({
    channels: [],
    currentChannel: null,

    fetchChannels: async () => {
      const token = useAuthStore.getState().token
      const res = await fetch('/channels', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) set({ channels: data })
    },

    createChannel: async (name: string) => {
      const token = useAuthStore.getState().token
      const res = await fetch('/channels', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) await useChannelStore.getState().fetchChannels()
    },

    setCurrentChannel: (channel) => set({ currentChannel: channel }),
  }))
