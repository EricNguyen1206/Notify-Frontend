import { create } from 'zustand';
// import { io, Socket } from 'socket.io-client'


import { WS_MESSAGE_TYPE } from './constant';
import { useChannelStore } from './useChannelStore';
import { useChatStore } from './useChatStore';

export interface WsMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: string
  type: WS_MESSAGE_TYPE
  chatId: string
}

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  // Chat data
  messages: WsMessage[],
  connect: (userId: number) => void;
  sendMessage: (channelId: number, msg: string) => void;
  joinChannel: (channelId: number) => void;
  leaveChannel: (channelId: number) => void;
  disconnect: () => void;
}


export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  error: null,
  messages: [],

  connect: (userId: number) => {
    // Prevent multiple connections
    const { socket } = get()
    if (socket && socket.readyState === WebSocket.OPEN) {
      return
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    try {
      const baseWsUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080/api/v1';
      const newSocket = new WebSocket(`${baseWsUrl}/ws?userId=${userId}`);

      newSocket.onopen = () => {
        console.log('WebSocket connected')
        set({ isConnected: true, error: null })
      }

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        console.log('WebSocket message received:', message)
        
        // Handle channel messages
        if (message.type === "channel.message" && message.data) {
          const channelMessage = message.data;
          const activeChannelId = useChannelStore.getState().activeChannelId;
          
          console.log('Channel message:', channelMessage)
          console.log('Active channel ID:', activeChannelId)
          
          // Check if the message is for the current active channel
          if (activeChannelId && channelMessage.channelId === activeChannelId) {
            console.log('Adding message to chat store for channel:', activeChannelId)
            
            // Transform WebSocket message to Message format
            const transformedMessage = {
              id: Number(channelMessage.id),
              channelId: channelMessage.channelId,
              createdAt: channelMessage.created_at,
              senderId: channelMessage.senderId,
              senderName: channelMessage.Sender?.username || "Unknown",
              senderAvatar: channelMessage.Sender?.avatar,
              text: channelMessage.text,
              type: "channel"
            };
            
            console.log('Transformed message:', transformedMessage)
            
            // Add message to chat store
            useChatStore.getState().addMessageToChannel(String(channelMessage.channelId), transformedMessage);
          } else {
            console.log('Message not for current channel or no active channel')
          }
        }
        
        set((state) => ({
          messages: [...state.messages, message]
        }))
      }

      newSocket.onclose = () => {
        console.log('WebSocket disconnected')
        set({ isConnected: false, socket: null })
      }

      newSocket.onerror = (error) => {
        console.log('WebSocket error:', error)
        set({ error: 'WebSocket connection failed', isConnected: false })
      }

      set({ socket: newSocket })
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      set({ error: 'Failed to create WebSocket connection' })
    }
  },

  sendMessage: (channelId: number, msg: string) => {
    console.log('TEST msg', msg)
    const { socket, isConnected } = get();
    if(!socket || !isConnected || !channelId) {
      console.log('SOCKET empty');
      return;
    }
    const data = {
      channelId, text: msg
    }
    socket.send(JSON.stringify({type: "channel.message", data}))
  },

  joinChannel: (channelId: number) => {
    const { socket, isConnected } = get();
    if(!socket || !isConnected || !channelId) {
      return;
    }
    const data = {channel_id: channelId.toString()}
    socket.send(JSON.stringify({type: "channel.join", data}))
  },

  leaveChannel: (channelId: number) => {
    const { socket, isConnected } = get();
    if(!socket || !isConnected || !channelId) {
      console.log('SOCKET or CHANNEL empty');
      return;
    }
    const data = {channelId: channelId.toString()}
    socket.send(JSON.stringify({type: "channel.leave", data}))
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.close()
      set({ socket: null, isConnected: false })
    }
  },
}));
