"use client";
import { useSocketStore } from "@/store/useSocketStore";
import { useEffect } from "react";

interface MessagesWebSocketProviderProps {
  userId: number;
  children: React.ReactNode;
}

export default function MessagesWebSocketProvider({ userId, children }: MessagesWebSocketProviderProps) {
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (userId) {
      connect(userId);
      return () => {
        disconnect();
      };
    }

    return () => {
      // Cleanup if userId is not provided
      console.warn("Cleanup function for WebSocket connection");
      disconnect();
    }
  }, [userId, connect, disconnect]);

  return <>{children}</>;
}
