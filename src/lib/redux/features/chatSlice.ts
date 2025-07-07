import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId?: string;
  roomId?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatState {
  activeConversation: {
    type: 'private' | 'room';
    id: string;
    name: string;
    avatar?: string;
  } | null;
  privateMessages: Record<string, Message[]>;
  roomMessages: Record<string, Message[]>;
  onlineUsers: string[];
  typingUsers: string[];
}

const initialState: ChatState = {
  activeConversation: null,
  privateMessages: {},
  roomMessages: {},
  onlineUsers: [],
  typingUsers: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(
      state,
      action: PayloadAction<{ type: 'private' | 'room'; id: string; name: string; avatar?: string }>
    ) {
      state.activeConversation = action.payload;
    },
    addPrivateMessage(state, action: PayloadAction<{ userId: string; message: Message }>) {
      const { userId, message } = action.payload;
      if (!state.privateMessages[userId]) {
        state.privateMessages[userId] = [];
      }
      state.privateMessages[userId].push(message);
    },
    addRoomMessage(state, action: PayloadAction<{ roomId: string; message: Message }>) {
      const { roomId, message } = action.payload;
      if (!state.roomMessages[roomId]) {
        state.roomMessages[roomId] = [];
      }
      state.roomMessages[roomId].push(message);
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
    userTyping(state, action: PayloadAction<string>) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    userStoppedTyping(state, action: PayloadAction<string>) {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
    markMessagesAsRead(state, action: PayloadAction<{ conversationId: string; type: 'private' | 'room' }>) {
      const { conversationId, type } = action.payload;
      const messages = type === 'private' ? state.privateMessages[conversationId] : state.roomMessages[conversationId];
      
      if (messages) {
        messages.forEach(msg => {
          if (msg.status === 'delivered') {
            msg.status = 'read';
          }
        });
      }
    }
  }
});

export const {
  setActiveConversation,
  addPrivateMessage,
  addRoomMessage,
  setOnlineUsers,
  userTyping,
  userStoppedTyping,
  markMessagesAsRead
} = chatSlice.actions;

export default chatSlice.reducer;