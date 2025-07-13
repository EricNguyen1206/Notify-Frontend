"use client";

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

import {
  ChannelMessageChatType,
  DirectMessageChatType,
  UserType,
} from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import ServerChatInput from "./ChannelChatInput";
import TextChat from "../chat/TextChat";
import ImageChat from "../chat/ImageChat";
import FileChat from "../chat/FileChat";

import { IoMdNotifications } from "react-icons/io";
import { useGetChannelsId } from "@/services/endpoints/channels/channels";
import { useGetChatsChannelId, usePostChats } from "@/services/endpoints/chats/chats";
import { useAuthStore } from "@/store/useAuthStore";
import { handleFileUpload, handleFileExtUpload } from "@/lib/supabase";
import { ApplicationFileType } from "@/lib/utils";

export interface FormDataState {
  message: string;
}

const ChannelMainChat = () => {
  const params = useParams();
  const pathName = usePathname();
  // const { data: user }: any = useSession();
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState<FormDataState>({
    message: "",
  });
  const [screenHeight, setScreenHeight] = useState<any>(null);
  const [isOverFlow, setIsOverFlow] = useState<boolean>(false);
  const [noti, setNoti] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Get channelId from params
  const channelId = params?.["channel-id"];
  const channelIdNum = channelId && typeof channelId === "string" ? parseInt(channelId) : undefined;

  // Fetch channel info
  const { data: channel, isLoading: channelLoading } = useGetChannelsId(channelIdNum ?? 0, {
    query: { enabled: !!channelIdNum }
  });

  // Fetch chats for this channel
  const { data: channelChats, isLoading: chatsLoading, refetch: refetchChats } = useGetChatsChannelId(channelIdNum ?? 0, {
    query: { enabled: !!channelIdNum }
  });

  // Mutation for sending chat
  const postChatMutation = usePostChats({
    mutation: {
      onSuccess: () => {
        refetchChats();
        setFormData({ message: "" });
      },
      onError: () => {
        toast.error("Send message failed");
      }
    }
  });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.message) {
      toast.error("Message can not be empty");
      return;
    }
    if (channelIdNum && user?.id) {
      postChatMutation.mutate({
        data: {
          channelId: channelIdNum,
          text: formData.message,
          type: "channel"
        }
      });
    }
  };

  // TODO: Implement delete chat by id using react-query if API available
  const handleDeleteChatById = (chatId: string) => {
    toast.info("Delete chat feature not implemented in API");
  };

  // Direct file message selection
  const handleResetImage = () => {
    setFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0]?.name);
    }
  };

  const handleSendFileMessage = async () => {
    // Update file (image, document)
    const type = file?.type?.split("/")[0];
    const ext = file?.name?.split(".")[1];
    const fileDbName = file?.name;
    // const format = file?.type?.split("/")[1];
    const serverId = params?.id;
    const channelId = params?.["channel-id"];

    if (file === null) toast.error("Please upload file to send message");
    else if (fileName !== "" && type === "image") {
      setLoading(true);
      let image = null;
      const res = await handleFileUpload("uploads", "images", file);
      const { fullPath }: any = res;
      if (res === null) {
        toast.error("Upload image failed");
        return;
      }
      // Create image url
      image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${fullPath}`;
      // Create new image chat
      // if (socket && user?.id && serverId !== "" && channelId !== "") {
      //   socket.emit(
      //     "send_channel_message",
      //     {
      //       userId: user?.id,
      //       serverId: serverId,
      //       channelId: channelId,
      //       provider: "image",
      //       url: image,
      //     },
      //     (res: {
      //       message: string;
      //       user: UserType;
      //       chat: ChannelMessageChatType;
      //     }) => {
      //       // console.log("Check send channel message:", res);
      //       if (res?.message === "Send channel message successfully") {
      //         const newChat = { ...res?.chat, user: res };
      //         setChannelChats(newChat);
      //       }
      //     }
      //   );
      // }
    } else if (
      fileName !== "" &&
      fileDbName !== "" &&
      ext &&
      ApplicationFileType.includes(ext)
    ) {
      setLoading(true);
      let fileUrl = null;
      const res = await handleFileExtUpload("uploads", "files", file, ext);
      const { fullPath }: any = res;
      if (res === null) {
        toast.error("Upload file failed");
        return;
      }
      // Create file url
      fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${fullPath}`;
      // Create new image chat
      // if (socket && user?.id && serverId !== "" && channelId !== "") {
      //   socket.emit(
      //     "send_channel_message",
      //     {
      //       userId: user?.id,
      //       serverId: serverId,
      //       channelId: channelId,
      //       provider: "file",
      //       url: fileUrl,
      //       fileName: fileDbName,
      //     },
      //     (res: {
      //       message: string;
      //       user: UserType;
      //       friend: UserType;
      //       chat: DirectMessageChatType;
      //     }) => {
      //       // console.log("Check send direct message:", res);
      //       if (res?.message === "Send channel message successfully") {
      //         const newChat = { ...res?.chat, user: res };
      //         setChannelChats(newChat);
      //       }
      //     }
      //   );
      // }
    } else toast.error("File format not correct");

    setLoading(false);
    handleResetImage();
  };

  const handleUserKeyPress = useCallback(
    (event: any) => {
      const { key, keyCode } = event;
      if (file && fileInputRef?.current) {
        fileInputRef?.current.blur();
        if (key === "Enter") {
          handleSendFileMessage();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [file]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const handleDownloadFile = async (
    bucket: string,
    folderName: string,
    chat: DirectMessageChatType
  ) => {
    const fileName = chat?.url?.split(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${folderName}`
    )[1];

    if (chat?.url && fileName) {
      saveAs(chat?.url, fileName);
    }
  };

  return (
    <div className="relative w-[100%] h-screen flex flex-col">
      <div
        className="w-[100%] h-[51px] px-6 border border-l-0 border-r-0 border-t-0 border-b-primary-black
                        flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <p className="text-[25px] font-bold dark:text-gray-400">#</p>
          <p className="text-[13px] font-bold dark:text-gray-400">
            {channel?.data?.name}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button>
                  <IoMdNotifications size={25} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notification Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`w-[100%] max-h-[calc(100vh-156px)] h-[calc(100vh-156px)] overflow-y-auto flex px-6 py-4 ${
          !isOverFlow && "items-end"
        }`}
      >
        <div ref={chatBoxRef} className="w-[100%] flex flex-col gap-8">
          {chatsLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-zinc-300" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-zinc-300" />
                <Skeleton className="h-4 w-[200px] bg-zinc-300" />
              </div>
            </div>
          ) : (
            channelChats?.data?.map((chat: any) => {
              if (!chat) {
                return (
                  <div key={uuidv4()}>
                    <p>Chat is not available</p>
                  </div>
                );
              }
              if (chat?.provider === "text") {
                return (
                  <TextChat
                    key={uuidv4()}
                    userIdSession={user?.id.toString() || ""}
                    chat={chat}
                    friend={chat}
                    mainRef={mainRef}
                    handleDeleteChatById={handleDeleteChatById}
                  />
                );
              }
              if (chat?.provider === "image") {
                return (
                  <ImageChat
                    key={uuidv4()}
                    userIdSession={user?.id.toString() || ""}
                    user={chat}
                    chat={chat}
                    friend={chat}
                    mainRef={mainRef}
                    handleDeleteChatById={handleDeleteChatById}
                    handleDownloadFile={handleDownloadFile}
                  />
                );
              }
              if (chat?.provider === "file") {
                return (
                  <FileChat
                    key={uuidv4()}
                    userIdSession={user?.id.toString() || ""}
                    user={chat}
                    chat={chat}
                    friend={chat}
                    mainRef={mainRef}
                    handleDeleteChatById={handleDeleteChatById}
                    handleDownloadFile={handleDownloadFile}
                  />
                );
              }
              return null;
            })
          )}
        </div>
      </div>
      <div className="absolute w-[100%] h-[100px] bottom-0 px-6 py-4">
        <ServerChatInput
          channelName={channel?.data?.name ? channel.data.name : "undefined"}
          handleSendMessage={handleSendMessage}
          formData={formData}
          setFormData={setFormData}
          file={file}
          fileName={fileName}
          fileInputRef={fileInputRef}
          handleResetImage={handleResetImage}
          handleFileSelection={handleFileSelection}
          handleSendFileMessage={handleSendFileMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ChannelMainChat;
