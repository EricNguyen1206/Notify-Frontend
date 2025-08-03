"use client";

import { useSocketStore } from "@/store/useSocketStore";
import { useEffect } from "react";

interface MessagesWebSocketProviderProps {
  userId: number;
  autoConnect: boolean;
  children: React.ReactNode;
}

export default function MessagesWebSocketProvider({ userId, autoConnect, children }: MessagesWebSocketProviderProps) {
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (autoConnect) {
      connect(userId);
      console.info("Websocket connect success!")
    }

    return () => {
      // Cleanup if userId is not provided
      console.warn("Cleanup function for WebSocket connection");
      disconnect();
    }
  }, [userId, autoConnect, connect, disconnect]);

  // Handle page visibility changes to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoConnect) {
        connect(userId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connect, userId, autoConnect])

  return <>{children}</>;
}
