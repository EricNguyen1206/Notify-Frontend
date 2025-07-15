"use client";

import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSocketStore } from "@/store/useSocketStore";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";

import { DirectMessageChatType, UserType } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import TextChat from "./TextChat";
import ChatInput from "./ChatInput";
import ImageChat from "./ImageChat";
import FileChat from "./FileChat";

import { PiPhoneCallFill } from "react-icons/pi";
import { FaCircleUser } from "react-icons/fa6";
import { toast } from "react-toastify";
import { formatDateStr, getSummaryName } from "@/lib/helper";
import { ApplicationFileType } from "@/lib/utils";
import { useGetUsersProfile } from "@/services/endpoints/users/users";
import { useGetChatsChannelId } from "@/services/endpoints/chats/chats";
import { handleFileExtUpload, handleFileUpload } from "@/lib/supabase";
import { ModelsChatResponse } from "@/services/schemas";
import { useAuthStore } from "@/store/useAuthStore";

export interface FormDataState {
  message: string;
}

const MainChat = () => {
  const params = useParams();

  // Get current user profile
  const sessionUser = useAuthStore((state) => state.user);

  // Get channelId from params (as number)
  const channelId = params?.id?.[0] ? Number(params.id[0]) : undefined;

  // Fetch chats for the channel using react-query
  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetChatsChannelId(channelId ?? 0, { query: { enabled: !!channelId } });

  // Map API response to DirectMessageChatType[]
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

  const [formData, setFormData] = useState<FormDataState>({
    message: "",
  });
  const [screenHeight, setScreenHeight] = useState(720);
  const [isOverFlow, setIsOverFlow] = useState<boolean>(false);
  const [noti, setNoti] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketStore();

  // Remove all friend/direct message logic
  // Only channel chat logic remains

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

  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight > screenHeight - 210
    )
      setIsOverFlow(true);
  }, [chatBoxRef?.current?.clientHeight]);

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

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatsLoading]);

  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight < screenHeight - 210
    )
      setIsOverFlow(false);
  }, [chats, screenHeight]);

  useEffect(() => {
    if (noti) {
      toast.warn(message);
      setMessage("");
      setNoti(false);
    }
  }, [noti]);

  // File upload logic is left as dummy/commented

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setFormData({ message: "" });
    }
  };

  // ... keep file upload and download logic as dummy/commented ...

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
          {chats?.map((chat: DirectMessageChatType) => {
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
            // if (chat?.provider === "text") {
              return (
                <TextChat
                  key={uuidv4()}
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
