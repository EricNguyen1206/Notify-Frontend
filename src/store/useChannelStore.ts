import { UserType } from '@/types'
import { create } from 'zustand'

export interface EnhancedChannel {
  id: number
  name: string
  ownerId: number
  type: 'group' | 'direct'
  avatar: string
  lastActivity: Date
  unreadCount: number
  members?: UserType[] // load lazy khi cần
}

// stores/channelStore.ts
export interface ChannelState {
  unreadCounts: Record<number, number>
  activeChannelId: number | null
  currentChannel: EnhancedChannel | null
  groupChannels: EnhancedChannel[]
  directChannels: EnhancedChannel[]
  setUnreadCount: (channelId: number, count: number) => void
  setActiveChannel: (channelId: number) => void
  setCurrentChannel: (channel: EnhancedChannel) => void
  markAsRead: (channelId: number) => void
  setGroupChannels: (channels: EnhancedChannel[]) => void
  setDirectChannels: (channels: EnhancedChannel[]) => void
}

export const useChannelStore = create<ChannelState>((set) => ({
  unreadCounts: {},
  activeChannelId: null,
  currentChannel: null,
  groupChannels: [],
  directChannels: [],
  setUnreadCount: (channelId, count) => 
    set(state => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: count }
    })),
  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  markAsRead: (channelId) =>
    set(state => ({
      unreadCounts: { ...state.unreadCounts, [channelId]: 0 }
    })),
  setGroupChannels: (channels: EnhancedChannel[]) => set({ groupChannels: channels }),
  setDirectChannels: (channels: EnhancedChannel[]) => set({ directChannels: channels }),
}))
