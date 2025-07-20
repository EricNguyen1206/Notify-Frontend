import { create } from 'zustand'

interface Channel {
    id: number
    name: string
    ownerId: number
    createdAt: string
  }

  interface ChannelState {
    channels: Channel[]
    currentChannel: Channel | null
    setChannels: (channelsData: Channel[]) => void
    setCurrentChannel: (channel: Channel) => void
    addChannel: (channel: Channel) => void
  }

  export const useChannelStore = create<ChannelState>((set) => ({
    channels: [],
    currentChannel: null,

    setChannels: (channelsData: Channel[]) => set({channels: channelsData}),
    setCurrentChannel: (channel) => set({ currentChannel: channel }),
    addChannel: (newChannel: Channel) => set((state) => ({channels: [...state.channels, newChannel]}))
  }))
