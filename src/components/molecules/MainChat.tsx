// External libraries
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

// Types/interfaces
import { ModelsChatResponse } from "@/services/schemas";
import { DirectMessageChatType } from "@/types";

// UI components
import { Skeleton } from "@/components/ui/skeleton";

// Local components
import ChatInput from "./ChatInput";
import TextChat from "./TextChat";

// Services/hooks
import { useGetChatsChannelId, usePostChats } from "@/services/endpoints/chats/chats";

// Store/state
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";

export interface FormDataState {
  message: string;
}

const MainChat = () => {
  // Store and session
  const params = useParams();
  const sessionUser = useAuthStore((state) => state.user);
  const { socket } = useSocketStore();
  const sendChatMutation = usePostChats();

  // Derived variables
  const channelId = params?.id?.[0] ? Number(params.id[0]) : undefined;

  // Data fetching hooks
  const {
    data: chatsData,
    isLoading: chatsLoading,
  } = useGetChatsChannelId(channelId ?? 0, { query: { enabled: !!channelId } });

  // State
  const [formData, setFormData] = useState<FormDataState>({ message: "" });
  const [screenHeight, setScreenHeight] = useState(720);
  const [isOverFlow, setIsOverFlow] = useState<boolean>(false);
  const [noti, setNoti] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Derived chats
  const chats: DirectMessageChatType[] = Array.isArray(chatsData?.data)
    ? chatsData.data.map((chat: ModelsChatResponse) => ({
        id: chat.id!,
        user: {}, // You may want to fetch user details if needed
        userId: chat.senderId ?? 0,
        friendId: String(chat.receiverId ?? ""),
        text: chat.text ?? "",
        type: chat.type ?? "",
        provider: chat.type ?? "",
        url: chat.url ?? "",
        fileName: chat.fileName ?? "",
        sended: chat.createdAt ?? "",
      }))
    : [];

  // --- useEffect hooks ---

  // Set initial screen height and handle resize
  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };
    if (typeof window !== "undefined") {
      setScreenHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  // Set overflow if chatBox is taller than available height
  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight > screenHeight - 210
    )
      setIsOverFlow(true);
  }, [chatBoxRef?.current?.clientHeight]);

  // Scroll to bottom when chats change
  useEffect(() => {
    if (chats !== undefined) {
      if (chats?.length) {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        mainRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [chats?.length]);

  // Scroll to bottom when chats update
  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // Scroll to bottom when loading
  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatsLoading]);

  // Set overflow false if chatBox is shorter than available height
  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight < screenHeight - 210
    )
      setIsOverFlow(false);
  }, [chats, screenHeight]);

  // Show notification toast
  useEffect(() => {
    if (noti) {
      toast.warn(message);
      setMessage("");
      setNoti(false);
    }
  }, [noti]);

  // Clean up effect to reset file and form data
  useEffect(() => {
    return () => {
      setFile(null);
      setFileName("");
      setFormData({ message: "" });
      setIsOverFlow(false);
      setScreenHeight(720);
      setNoti(false);
      setMessage("");
    };
  }, []);

  // --- Event Handlers ---

  // Synchronous/async event handlers
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("TEST1", formData);
    if (!channelId) {
      toast.error("Channel ID is required to send a message");
      return;
    }
    if (formData?.message === "") {
      toast.error("Message can not be empty");
      return;
    }
    if (socket && sessionUser?.id && formData?.message !== "" && fileName === "") {
      const msg = {
        action: "message",
        channelId: String(channelId),
        text: formData.message,
      };
      socket.send(JSON.stringify(msg));
      sendChatMutation.mutate({
        data: {
          channelId: channelId,
          text: formData.message,
          type: "channel",
        },
      });
      setFormData({ message: "" });
    }
  };

  // --- Render ---

  return (
    <div className="relative w-[100%] h-screen flex flex-col">
      <div className="w-[100%] h-[56px] px-6 border border-l-0 border-r-0 border-t-0 border-b-primary-black flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Channel info can go here if needed */}
        </div>
        <div className="flex items-center gap-5">
          {/* Channel actions can go here if needed */}
        </div>
      </div>
      <div
        ref={containerRef}
        className={`w-[100%] max-h-[calc(100vh-156px)] h-[calc(100vh-156px)] overflow-y-auto flex px-6 py-4 ${!isOverFlow && "items-end"}`}
      >
        <div ref={chatBoxRef} className="w-[100%] flex flex-col gap-8">
          {/* No friend header, just channel chat history */}
          {chats.map((chat: DirectMessageChatType) => {
            if (chatsLoading) {
              return (
                <div key={uuidv4()} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-zinc-300" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-zinc-300" />
                    <Skeleton className="h-4 w-[200px] bg-zinc-300" />
                  </div>
                </div>
              );
            }
            return (
              <TextChat
                key={chat.id}
                userIdSession={sessionUser?.id!}
                chat={chat}
                mainRef={mainRef}
                handleDeleteChatById={() => {}}
              />
            );
          })}
        </div>
      </div>
      <div className="absolute w-[100%] h-[100px] bottom-0 px-6 py-4">
        <ChatInput
          friendName={"Channel"}
          handleSendMessage={handleSendMessage}
          formData={formData}
          setFormData={setFormData}
          file={file}
          fileName={fileName}
          fileInputRef={fileInputRef}
          handleResetImage={() => {}}
          handleFileSelection={() => {}}
          handleSendFileMessage={() => {}}
          loading={false}
        />
      </div>
    </div>
  );
};

export default MainChat;
