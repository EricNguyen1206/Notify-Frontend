import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface SocketState {
  isConnected: boolean;
  messages: Message[];
  error: string | null;
  typingUsers: string[];
  ws: WebSocket | null
}

const initialState: SocketState = {
  isConnected: false,
  messages: [],
  error: null,
  typingUsers: [],
  ws: null
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    // Connection actions
    connect: (state) => {
      state.isConnected = true;
      state.error = null;
    },
    disconnect: (state) => {
      state.isConnected = false;
    },
    connectionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnected = false;
    },

    // Message actions
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },

    // Typing indicator actions
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(
        (user) => user !== action.payload
      );
    },
    joinChannel: (state, action: PayloadAction<{channelId: string, clientId: string, username: string}>) => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/ws/joinChannel/${action.payload.channelId}?clientId=${action.payload.clientId}&username=${action.payload.username}`)
      state.ws = ws
    }
  },
});

// Export actions
export const {
  connect,
  disconnect,
  connectionError,
  addMessage,
  clearMessages,
  addTypingUser,
  removeTypingUser,
  joinChannel,
} = socketSlice.actions;

// Export selectors
export const selectIsConnected = (state: { socket: SocketState }) =>
  state.socket.isConnected;
export const selectMessages = (state: { socket: SocketState }) =>
  state.socket.messages;
export const selectError = (state: { socket: SocketState }) =>
  state.socket.error;
export const selectTypingUsers = (state: { socket: SocketState }) =>
  state.socket.typingUsers;
export const selectWs = (state: {socket: SocketState}) => state.socket.ws

export default socketSlice.reducer;
