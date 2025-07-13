import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'


import { useChatStore } from './useChatStore'

interface SocketState {
  socket: Socket | null
  connect: (userId: number) => void
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,

  connect: (userId) => {
    const baseWsUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080'
    const socket = io(`${baseWsUrl}/ws?userId=${userId}`, {
      transports: ['websocket'],
    })

    socket.on('chat_message', (msg) => {
      useChatStore.getState().addMessage(msg)
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = useSocketStore.getState()
    socket?.disconnect()
    set({ socket: null })
  },
}))
