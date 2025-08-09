"use client";

import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { useGetMessagesChannelId } from "@/services/endpoints/chats/chats";
import { ChatServiceInternalModelsChatRequest, ChatServiceInternalModelsChatRequestType, ChatServiceInternalModelsChatResponse } from "@/services/schemas";
import { useAuthStore } from "@/store/useAuthStore";
import { useChannelStore } from "@/store/useChannelStore";
import { Message, useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

// Hook for managing channel navigation and validation
export const useChannelNavigation = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { activeChannelId, groupChannels, directChannels, setCurrentChannel, setActiveChannel } = useChannelStore();

  const channelId = params.id ? Number(params.id) : undefined;

  useEffect(() => {
    if (!channelId) {
      router.replace("/messages");
      return;
    }

    if (activeChannelId !== channelId) {
      setActiveChannel(channelId);
      let chan = groupChannels.find(ch => ch.id == channelId)
      if (!chan) {
        directChannels.find(ch => ch.id == channelId)
      }
      setCurrentChannel(chan!)
    }
  }, [channelId, activeChannelId, groupChannels, directChannels, router]);

  return {
    channelId,
    activeChannelId,
  };
};

// Hook for managing chat data and messages
export const useChatData = (channelId: number | undefined) => {
  const { data: chatsData, isLoading: chatsLoading } = useGetMessagesChannelId(channelId ?? 0);
  const [optimisticChats, setOptimisticChats] = useState<Message[]>([]);
  const { addMessageToChannel, channels } = useChatStore();
  
  // Get messages from chat store for current channel
  const storeMessages = useMemo(() => 
    channelId ? channels[String(channelId)] || [] : [], [channels]
  );

  // Transform API data to Message format
  const chats: Message[] = [
    ...Array.isArray(chatsData?.data.items)
      ? chatsData.data.items.map((chat: ChatServiceInternalModelsChatResponse) => (chat as Message))
      : [],
    ...optimisticChats,
    ...storeMessages, // Include messages from WebSocket
  ] as Message[];

  return {
    chats,
    chatsLoading,
    optimisticChats,
    setOptimisticChats,
    addMessageToChannel,
  };
};

// Hook for managing scroll behavior
export const useScrollBehavior = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    mainRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToBottomOnUpdate = () => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return {
    containerRef,
    mainRef,
    scrollToBottom,
    scrollToBottomOnUpdate,
  };
};

// Hook for managing form state and notifications
export const useFormState = () => {
  const [formData, setFormData] = useState<{ message: string }>({ message: "" });
  const [noti, setNoti] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Show notification toast
  useEffect(() => {
    if (noti) {
      toast.warn(message);
      setMessage("");
      setNoti(false);
    }
  }, [noti, message]);

  // Clean up effect
  useEffect(() => {
    return () => {
      setFile(null);
      setFileName("");
      setFormData({ message: "" });
      setNoti(false);
      setMessage("");
    };
  }, []);

  return {
    formData,
    setFormData,
    noti,
    setNoti,
    message,
    setMessage,
    file,
    setFile,
    fileName,
    setFileName,
  };
};

// Hook for managing message sending
export const useMessageSending = (
  channelId: number | undefined,
  sessionUser: any,
  type: ChatServiceInternalModelsChatRequestType,
  setOptimisticChats: (updater: (prev: Message[]) => Message[]) => void,
  addMessageToChannel: (channelId: string, msg: Message) => void,
  setFormData: (data: { message: string }) => void,
  scrollToBottom: () => void
) => {
  // const { mutate: sendChatMessage } = usePostMessages();
  const { sendMessage } = useSocketStore()

  const handleSendMessage = async (message: string) => {
    if (sessionUser?.id && message !== "" && channelId) {
      const data: ChatServiceInternalModelsChatRequest = {
        channelId: channelId,
        text: message,
        type: type,
      }

      sendMessage(channelId, message)

      setFormData({ message: "" });
      scrollToBottom();
    }
  };

  return {
    handleSendMessage,
  };
};

// Main hook that combines all other hooks
export const useChatPage = () => {
  const sessionUser = useAuthStore((state) => state.user);
  const user = useAuthStore((state) => state.user);
  const [join, setJoin] = useState(false)

  const { screenHeight, isOverFlow, updateOverflow } = useScreenDimensions(720);
  const { channelId, activeChannelId } = useChannelNavigation();
  const { socket, isConnected, joinChannel, leaveChannel } = useSocketStore()
  const { chats, chatsLoading, optimisticChats, setOptimisticChats, addMessageToChannel } = useChatData(channelId);
  const { containerRef, mainRef, scrollToBottom, scrollToBottomOnUpdate } = useScrollBehavior();
  const { formData, setFormData, noti, setNoti, message, setMessage, file, setFile, fileName, setFileName } = useFormState();
  const { handleSendMessage } = useMessageSending(
    channelId,
    sessionUser,
    'channel',
    setOptimisticChats,
    addMessageToChannel,
    setFormData,
    scrollToBottom,
  );

  // Scroll effects
  useEffect(() => {
    if (chats !== undefined && chats?.length) {
      scrollToBottom();
    }
  }, [chats?.length]);

  useEffect(() => {
    scrollToBottomOnUpdate();
  }, [chats]);

  useEffect(() => {
    scrollToBottomOnUpdate();
  }, [chatsLoading]);

  useEffect(() => {
    console.log("TEST socket", socket==null)
    console.log("TEST isConnected", isConnected())
    console.log("TEST channelId", channelId)
    console.log("TEST join", join)
    if (socket && isConnected() && channelId && !join) {
      joinChannel(channelId)
      setJoin(true);
    }

    return () => {
      if (channelId && join) {
        leaveChannel(channelId)
      }
    }
  }, [socket, isConnected, channelId, join])

  return {
    // User data
    sessionUser,
    user,

    // Channel data
    channelId,
    activeChannelId,

    // Chat data
    chats,
    chatsLoading,

    // Form state
    formData,
    setFormData,

    // Screen dimensions
    screenHeight,
    isOverFlow,
    updateOverflow,

    // Refs
    containerRef,
    mainRef,

    // Handlers
    handleSendMessage,
  };
};
