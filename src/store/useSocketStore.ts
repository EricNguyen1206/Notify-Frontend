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
  error: string | null;
  // Chat data
  messages: WsMessage[],
  // Computed functions
  isConnected: () => boolean;
  // Actions
  connect: (userId: number) => void;
  sendMessage: (channelId: number, msg: string) => void;
  joinChannel: (channelId: number) => void;
  leaveChannel: (channelId: number) => void;
  disconnect: () => void;
}

// Helper function to check if WebSocket is connected
const isSocketConnected = (socket: WebSocket | null): boolean => {
  return socket !== null && socket.readyState === WebSocket.OPEN;
};

// Helper function to check if WebSocket is connecting
const isSocketConnecting = (socket: WebSocket | null): boolean => {
  return socket !== null && socket.readyState === WebSocket.CONNECTING;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  error: null,
  messages: [],

  // Computed function for connection status
  isConnected: () => {
    return isSocketConnected(get().socket);
  },

  connect: (userId: number) => {
    const { socket, isConnected } = get();
    
    // Prevent multiple connections - check both OPEN and CONNECTING states
    if (isConnected() || isSocketConnecting(socket)) {
      console.log('WebSocket already connected or connecting, skipping...');
      return;
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('Server side detected, skipping WebSocket connection');
      return;
    }

    // Close existing socket if it exists but is not in a good state
    if (socket && socket.readyState === WebSocket.CLOSED) {
      console.log('Cleaning up closed socket before creating new one');
      set({ socket: null, error: null });
    }

    try {
      const baseWsUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080/api/v1';
      const newSocket = new WebSocket(`${baseWsUrl}/ws?userId=${userId}`);
      
      console.log('Creating new WebSocket connection for userId:', userId);

      newSocket.onopen = () => {
        console.info('WebSocket connected successfully');
        set({ error: null }); // Clear any previous errors
      };

      newSocket.onmessage = (event) => {
        const message = typeof event.data == "string" ? JSON.parse(event.data): "";
        console.info('WebSocket message received:', message);
        
        // Handle channel messages
        if (message.type === "channel.message" && message.data) {
          const channelMessage = message.data;
          const activeChannelId = useChannelStore.getState().activeChannelId;
          
          // Check if the message is for the current active channel
          if (activeChannelId && channelMessage.channelId === activeChannelId) {
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
            
            // Add message to chat store
            useChatStore.getState().addMessageToChannel(String(channelMessage.channelId), transformedMessage);
          } else {
            console.log('Message not for current channel or no active channel');
          }
        }
        
        set((state) => ({
          messages: [...state.messages, message]
        }));
      };

      newSocket.onclose = (event) => {
        console.info('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        set({ socket: null, error: null });
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ 
          error: 'WebSocket connection failed',
          socket: null // Clear socket on error
        });
      };

      // Set the new socket immediately after creating it
      set({ socket: newSocket });
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set({ 
        error: 'Failed to create WebSocket connection',
        socket: null
      });
    }
  },

  sendMessage: (channelId: number, msg: string) => {
    console.log('Sending message:', msg);
    const { socket, isConnected } = get();
    
    if (!isConnected() || !channelId) {
      console.log('Cannot send message: socket not connected or invalid channelId');
      return;
    }
    
    const data = {
      channelId, 
      text: msg
    };
    
    try {
      socket!.send(JSON.stringify({type: "channel.message", data}));
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message' });
    }
  },

  joinChannel: (channelId: number) => {
    console.log('Joining channel:', channelId);
    const { socket, isConnected } = get();
    
    if (!isConnected() || !channelId) {
      console.log('Cannot join channel: socket not connected or invalid channelId');
      return;
    }
    
    const data = { channel_id: channelId.toString() };
    
    try {
      socket!.send(JSON.stringify({type: "channel.join", data}));
    } catch (error) {
      console.error('Error joining channel:', error);
      set({ error: 'Failed to join channel' });
    }
  },

  leaveChannel: (channelId: number) => {
    console.log('Leaving channel:', channelId);
    const { socket, isConnected } = get();
    
    if (!isConnected() || !channelId) {
      console.log('Cannot leave channel: socket not connected or invalid channelId');
      return;
    }
    
    const data = { channelId: channelId.toString() };
    
    try {
      socket!.send(JSON.stringify({type: "channel.leave", data}));
    } catch (error) {
      console.error('Error leaving channel:', error);
      set({ error: 'Failed to leave channel' });
    }
  },

  disconnect: () => {
    const { socket } = get();
    
    if (socket) {
      console.log('Disconnecting WebSocket');
      socket.close(1000, 'Client disconnecting'); // Normal closure
      set({ socket: null, error: null });
    }
  },
}));
