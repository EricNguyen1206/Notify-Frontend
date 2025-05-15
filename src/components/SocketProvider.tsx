"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSocketStore } from "@/lib/store";

import { GetSocketConnect, StartListeners } from "@/lib/socket";
import { Socket } from "socket.io-client";

type Props = {
  children?: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const session = {user: {id: "123", name: "John Doe", email: "john.doe@example.com"}}

  const socket = useSocket(process.env.NEXT_PUBLIC_API_URL!, {
    autoConnect: false,
  });

  const updateSocket = useSocketStore((state) => state.updateSocket);
  const updateClientId = useSocketStore((state) => state.updateClientId);

  // Socket event
  useEffect(() => {
    socket.connect();

    if (session?.user) {
      updateSocket(socket);

      // Listen event to socket
      StartListeners(socket);

      // Send event to socket
      GetSocketConnect(socket, session?.user?.email, updateClientId);

      //   GetAllUsers(socket);
    }

    // eslint-disable-next-line
  }, [session?.user]);

  return <>{children}</>;
};

export default SocketProvider;
