"use client";

import { useWebSocketConnection } from "@/app/messages/action";

interface MessagesWebSocketProviderProps {
  userId: number;
  children: React.ReactNode;
}

export default function MessagesWebSocketProvider({ userId, children }: MessagesWebSocketProviderProps) {
  // Use centralized WebSocket connection management
  const { isConnected, error } = useWebSocketConnection(userId);

  // Optional: Log connection status for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('WebSocket status:', { isConnected, error });
  }

  return <>{children}</>;
}
