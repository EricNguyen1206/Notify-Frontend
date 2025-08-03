import { create } from 'zustand';
// import { io, Socket } from 'socket.io-client'


import { WS_MESSAGE_TYPE } from './constant';

export interface WsMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: string
  type: 'text' | 'image' | 'file'
  status: WS_MESSAGE_TYPE
  chatId: string
}

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  // Chat data
  messages: WsMessage[],
  connect: (userId: number) => void;
  disconnect: () => void;
}


export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  error: null,
  messages: [],
  

  // connect: (userId: number) => {
  //   console.log("Connecting to WebSocket with userId:", userId);
  //   // If already connected, do nothing
  //   // This prevents multiple connections if connect is called multiple times
  //   // This is important to avoid memory leaks and multiple event listeners
  //   const { socket } = get()
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     return; // Already connected
  //   }
  //   const baseWsUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080';
  //   const ws = new WebSocket(`${baseWsUrl}/ws?userId=${userId}`);

  //   ws.onopen = () => {
  //     console.log("WebSocket connection established");
  //     set({ socket: ws });
  //     // Connection established
  //   };

  //   ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data) as ChatServiceInternalModelsChatResponse;
  //       // Expecting: { channelId: "4", userId: 2, text: "TEST", sentAt: "..." }
  //       if (data.channelId && data.text && data.senderId) {
  //         useChatStore.getState().addMessageToChannel(String(data.channelId), {
  //           id: data.id!,
  //           text: data.text,
  //           senderId: data.senderId,
  //           channelId: Number(data.channelId),
  //           type: data.type as 'channel' | 'direct',
  //           createdAt: data.createdAt || new Date().toISOString(),
  //         });

  //         const currentCount = useChannelStore.getState().unreadCounts[Number(data.channelId)] || 0
  //         useChannelStore.getState().setUnreadCount(Number(data.channelId), currentCount + 1)
  //       }
  //     } catch (e) {
  //       // Handle non-JSON or unexpected messages
  //     }
  //   };

  //   ws.onclose = () => {
  //     // Connection closed
  //     console.log("WebSocket connection closed");
  //     set({ socket: null });
  //   };

  //   ws.onerror = (err) => {
  //     console.error("WebSocket error:", err);
  //     // Optionally handle errors
  //   };

  //   set({ socket: ws });
  // },

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
        set((state) => ({
          messages: [...state.messages, message]
        }))
      }

      newSocket.onclose = () => {
        console.log('WebSocket disconnected')
        set({ isConnected: false, socket: null })
      }

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        set({ error: 'WebSocket connection failed', isConnected: false })
      }

      set({ socket: newSocket })
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      set({ error: 'Failed to create WebSocket connection' })
    }
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.close()
      set({ socket: null, isConnected: false })
    }
  },
}));
