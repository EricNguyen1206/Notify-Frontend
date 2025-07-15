"use client";
import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";

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
  }, [userId, connect, disconnect]);

  return <>{children}</>;
}
