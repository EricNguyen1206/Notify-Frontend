'use client';

import { io, Socket } from 'socket.io-client';
import { AppStore } from '@/lib/redux/store';
import {
  addPrivateMessage,
  addRoomMessage,
  setOnlineUsers,
  userTyping,
  userStoppedTyping
} from '@/lib/redux/features/chatSlice';

let socket: Socket;

export const connectSocket = (userId: string, store: AppStore) => {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    query: { userId },
    autoConnect: true
  });

  // Setup listeners
  socket.on('private-message', (message) => {
    store.dispatch(addPrivateMessage({ userId: message.senderId, message }));
  });

  socket.on('room-message', (message) => {
    store.dispatch(addRoomMessage({ roomId: message.roomId, message }));
  });

  socket.on('user-status', (users) => {
    store.dispatch(setOnlineUsers(users));
  });

  socket.on('user-typing', (userId) => {
    store.dispatch(userTyping(userId));
  });

  socket.on('user-stopped-typing', (userId) => {
    store.dispatch(userStoppedTyping(userId));
  });

  return socket;
};

export const getSocket = () => socket;

export const emitTyping = (conversationId: string, isTyping: boolean) => {
  if (socket) {
    socket.emit(isTyping ? 'typing' : 'stopped-typing', { conversationId });
  }
};

export const sendPrivateMessage = (recipientId: string, content: string) => {
  if (socket) {
    socket.emit('private-message', { recipientId, content });
  }
};

export const sendRoomMessage = (roomId: string, content: string) => {
  if (socket) {
    socket.emit('room-message', { roomId, content });
  }
};

export const joinRoom = (roomId: string) => {
  if (socket) {
    socket.emit('join-room', roomId);
  }
};