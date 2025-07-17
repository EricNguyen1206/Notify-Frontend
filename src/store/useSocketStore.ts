import { create } from 'zustand'
// import { io, Socket } from 'socket.io-client'


import { useChatStore } from './useChatStore'


interface SocketState {
  socket: WebSocket | null;
  connect: (userId: number) => void;
  disconnect: () => void;
}


export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connect: (userId: number) => {
    console.log("Connecting to WebSocket with userId:", userId);
    // If already connected, do nothing
    // This prevents multiple connections if connect is called multiple times
    // This is important to avoid memory leaks and multiple event listeners
    // If already connected, do nothing
    console.log("Current socket state:", get().socket);
    console.log("Checking if socket is already connected:", get().socket != null);
    if (get().socket != null) {
      return; // Already connected
    }
    const baseWsUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080';
    const ws = new WebSocket(`${baseWsUrl}/ws?userId=${userId}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      set({ socket: ws });
      // Connection established
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Expecting: { channelId: "4", userId: 2, text: "TEST", sentAt: "..." }
        if (data.channelId && data.text && data.userId) {
          useChatStore.getState().addMessageToChannel(String(data.channelId), {
            id: Date.now(), // or data.id if provided
            text: data.text,
            senderId: data.userId,
            channelId: Number(data.channelId),
            type: 'channel',
            createdAt: data.sentAt || new Date().toISOString(),
          });
        }
      } catch (e) {
        // Handle non-JSON or unexpected messages
      }
    };

    ws.onclose = () => {
      // Connection closed
      console.log("WebSocket connection closed");
      set({ socket: null });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      // Optionally handle errors
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
    }
    set({ socket: null });
  },
}));
