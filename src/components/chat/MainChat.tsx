"use client";

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useFriendStore, useSocketStore } from "@/lib/store";
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

import { getAllChatsByUserId, getUserById } from "@/utils/actions/api";
import { formatDateStr, getSummaryName } from "@/lib/helper";
import { ApplicationFileType } from "@/lib/utils";
import { handleFileExtUpload, handleFileUpload } from "@/utils/supabase";
import { useAppSelector } from "@/lib/redux/hook";

export interface FormDataState {
  message: string;
}

const MainChat = () => {
  const params = useParams();
  const pathName = usePathname();
  const user = useAppSelector(state => state.auth.user);
  const conn = useAppSelector(state => state.socket.ws)
  const router = useRouter();
  // const { data: session }: any = useSession();
  const session = {user: user}

  const [friend, setFriend] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    message: "",
  });
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [isOverFlow, setIsOverFlow] = useState<boolean>(false);
  const [noti, setNoti] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatsLoading, setChatsLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<Array<{ username: string }>>([])

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const socket = useSocketStore((state) => {
    return state.socket;
  });

  const chats = useFriendStore((state) => {
    return state.chats;
  });

  const setChats = useFriendStore((state) => {
    return state.setChats;
  });

  const updateChats = useFriendStore((state) => {
    return state.updateChats;
  });

  const userProfileToggle = useFriendStore((state) => {
    return state.userProfileToggle;
  });

  const setUserProfileToggle = useFriendStore((state) => {
    return state.setUserProfileToggle;
  });

  const handleGetFriendProfile = async () => {
    const friendId = params?.id[0];

    if (friendId !== undefined) {
      const res = await getUserById(friendId);
      if (res?.message === "Find user sucessfully") setFriend(res?.user);
    }
  };

  const handleGetAllChats = async () => {
    const friendId = params?.id[0];

    if (session?.user?.id && friendId !== undefined) {
      setChatsLoading(true);
      const res = await getAllChatsByUserId(session?.user?.id, friendId);

      if (res?.message === "Get all direct messages successfully") {
        updateChats(res?.chats);
      }

      setChatsLoading(false);
    }
  };

  useEffect(() => {
    handleGetFriendProfile();
    handleGetAllChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check screen height
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

  // Check chat box overflow
  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight > screenHeight - 210
    )
      setIsOverFlow(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatBoxRef?.current?.clientHeight]);

  // Chat auto scroll effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats?.length]);

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [loading]);

  useEffect(() => {
    if (
      chatBoxRef?.current?.clientHeight &&
      chatBoxRef?.current?.clientHeight < screenHeight - 210
    )
      setIsOverFlow(false);
  }, [chats, screenHeight]);

  useEffect(() => {
    // if (textarea.current) {
    //   autosize(textarea.current)
    // }

    if (conn === null) {
      router.push('/messages')
      return
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data)
      if (m.content == 'A new user has joined the room') {
        setUsers([...users, { username: m.username }])
      }

      if (m.content == 'user left the chat') {
        const deleteUser = users.filter((user) => user.username != m.username)
        setUsers([...deleteUser])
        setMessage([...messages, m])
        return
      }

      user?.username == m.username ? (m.type = 'self') : (m.type = 'recv')
      setMessage([...messages, m])
    }

    conn.onclose = () => {}
    conn.onerror = () => {}
    conn.onopen = () => {}
  }, [textarea, messages, conn, session.user])

  const sendMessage = () => {
    // if (!textarea.current?.value) return
    if (formData?.message == "") return
    if (conn === null) {
      router.push('/')
      return
    }

    conn.send(formData?.message)
    formData?.message = ""
  }

  // Receive direct message
  // useEffect(() => {
  //   if (socket) {
  //     socket.on(
  //       "receive_direct_message",
  //       (rs: {
  //         message: string;
  //         user: UserType;
  //         chat: DirectMessageChatType;
  //       }) => {
  //         // console.log("Receive direct message request:", rs);
  //         if (
  //           rs?.message === "You have new direct message" &&
  //           rs?.chat &&
  //           rs?.user
  //         ) {
  //           socket.emit(
  //             "get_all_chats",
  //             {
  //               userId: session?.user?.id,
  //               friendId: rs?.user?.id,
  //             },
  //             (res: {
  //               message: string;
  //               user: UserType;
  //               friend: UserType;
  //               chats: DirectMessageChatType[];
  //             }) => {
  //               // console.log("Check get all chats:", res);
  //               if (res?.chats) updateChats(res?.chats);
  //             }
  //           );
  //         }
  //       }
  //     );
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [socket]);

  // Get direct chat delete
  // useEffect(() => {
  //   if (socket) {
  //     socket.on(
  //       "get_chat_delete",
  //       (rs: {
  //         message: string;
  //         status: boolean;
  //         userId: string;
  //         friendId: string;
  //       }) => {
  //         // Send notification with friend client
  //         if (session?.user?.id === rs?.friendId && rs?.status === true) {
  //           // toast.warn(rs?.message);
  //           setMessage(rs?.message);
  //           setNoti(true);
  //         }

  //         // Update new chat with all user client
  //         if (rs?.status === true && session?.user?.id === rs?.userId) {
  //           socket.emit(
  //             "get_all_chats",
  //             {
  //               userId: session?.user?.id,
  //               friendId: rs?.friendId,
  //             },
  //             (res: {
  //               message: string;
  //               user: UserType;
  //               friend: UserType;
  //               chats: DirectMessageChatType[];
  //             }) => {
  //               if (res?.chats) updateChats(res?.chats);
  //             }
  //           );
  //         }

  //         // Update new chat with all friend client
  //         if (rs?.status === true && session?.user?.id === rs?.friendId) {
  //           const friendId = params?.id[0];

  //           socket.emit(
  //             "get_all_chats",
  //             {
  //               userId: session?.user?.id,
  //               friendId: friendId,
  //             },
  //             (res: {
  //               message: string;
  //               user: UserType;
  //               friend: UserType;
  //               chats: DirectMessageChatType[];
  //             }) => {
  //               if (res?.chats) updateChats(res?.chats);
  //             }
  //           );
  //         }
  //       }
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [socket, pathName]);

  useEffect(() => {
    if (noti) {
      toast.warn(message);
      setMessage("");
      setNoti(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noti]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData?.message === "") {
      toast.error("Message can not be empty");
      return;
    }

    if (!friend) {
      toast.error("Friend not found");
      return;
    }

    if (
      socket &&
      session?.user?.id &&
      formData?.message !== "" &&
      fileName === ""
    ) {
      socket.emit(
        "send_direct_message",
        {
          userId: session?.user?.id,
          friendId: friend?.id,
          provider: "text",
          text: formData.message,
        },
        (res: {
          message: string;
          user: UserType;
          friend: UserType;
          chat: DirectMessageChatType;
        }) => {
          // console.log("Check send direct message:", res);
          if (res?.chat) {
            // console.log("SEND CHAT", res?.chat);
            setChats(res?.chat);
          }
        }
      );

      setFormData({
        message: "",
      });
    }

    // setFormData({
    //   message: "",
    // });
  };

  const handleDeleteChatById = (chatId: string) => {
    if (
      confirm("Do you want to delete this chat?") == true &&
      socket &&
      session?.user &&
      friend
    ) {
      socket.emit(
        "delete_chat_by_id",
        {
          chatId: chatId,
          userId: session?.user?.id,
          friendId: friend?.id,
        },
        (res: { message: string; status: boolean }) => {
          // console.log("Check delete chat by id:", res);
          if (res?.status === true) {
            toast.success(res?.message);
            socket.emit(
              "get_all_chats",
              {
                userId: session?.user?.id,
                friendId: friend?.id,
              },
              (res: {
                message: string;
                user: UserType;
                friend: UserType;
                chats: DirectMessageChatType[];
              }) => {
                if (res?.chats) {
                  updateChats(res?.chats);
                }
              }
            );
          } else toast.error(res?.message);
        }
      );
    }
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
      if (socket && session?.user?.id) {
        socket.emit(
          "send_direct_message",
          {
            userId: session?.user?.id,
            friendId: friend?.id,
            provider: "image",
            url: image,
          },
          (res: {
            message: string;
            user: UserType;
            friend: UserType;
            chat: DirectMessageChatType;
          }) => {
            // console.log("Check send direct message:", res);
            if (res?.chat) {
              // console.log("SEND CHAT", res?.chat);
              setChats(res?.chat);
            }
          }
        );
      }
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
      if (socket && session?.user?.id) {
        socket.emit(
          "send_direct_message",
          {
            userId: session?.user?.id,
            friendId: friend?.id,
            provider: "file",
            url: fileUrl,
            fileName: fileDbName,
          },
          (res: {
            message: string;
            user: UserType;
            friend: UserType;
            chat: DirectMessageChatType;
          }) => {
            // console.log("Check send direct message:", res);
            if (res?.chat) {
              // console.log("SEND CHAT", res?.chat);
              setChats(res?.chat);
            }
          }
        );
      }
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
        className="w-[100%] h-[56px] px-6 border border-l-0 border-r-0 border-t-0 border-b-primary-black
                        flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-[35px] h-[35px]">
            <AvatarImage src={`${friend?.avatar}`} alt="avatar" />
            <AvatarFallback>
              {friend?.name && getSummaryName(friend?.name)}
            </AvatarFallback>
          </Avatar>
          <p className="text-[13px] font-bold dark:text-gray-400">
            {friend?.name}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button>
                  <PiPhoneCallFill size={25} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={setUserProfileToggle}>
                  <FaCircleUser size={25} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userProfileToggle ? "Hide" : "Show"} user profile</p>
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
          {friend !== null && (
            <div className="flex flex-col gap-3">
              <Avatar className="w-[70px] h-[70px]">
                <AvatarImage src={`${friend?.avatar}`} alt="avatar" />
                <AvatarFallback className="text-[30px]">
                  {friend?.name && getSummaryName(friend?.name)}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-xl">{friend?.name}</p>
              <p className="font-semibold text-sm">{friend?.email}</p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                This is the beginning of your direct message history with{" "}
                {friend?.name}
              </p>
              <div className="relative w-[100%] h-[1px] bg-primary-white dark:bg-zinc-400 my-5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[13px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-secondary-gray p-1">
                    {chats?.length !== 0 &&
                      chats[0]?.sended !== undefined &&
                      formatDateStr(chats[0]?.sended)}
                    {chats?.length === 0 &&
                      formatDateStr(new Date().toString())}
                  </div>
                </div>
              </div>
            </div>
          )}
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

            if (!chatsLoading && friend === null) {
              return (
                <div key={uuidv4()}>
                  <p>Chat is not available</p>
                </div>
              );
            }

            if (friend !== null && chat?.provider === "text") {
              return (
                <TextChat
                  key={uuidv4()}
                  userIdSession={session?.user?.id ?? ""}
                  user={
                    chat?.userId === session?.user?.id ? session?.user : friend
                  }
                  chat={chat}
                  friend={friend}
                  mainRef={mainRef}
                  handleDeleteChatById={handleDeleteChatById}
                />
              );
            }

            if (friend !== null && chat?.provider === "image") {
              return (
                <ImageChat
                  key={uuidv4()}
                  userIdSession={session?.user?.id ?? ""}
                  user={
                    chat?.userId === session?.user?.id ? session?.user : friend
                  }
                  chat={chat}
                  friend={friend}
                  mainRef={mainRef}
                  handleDeleteChatById={handleDeleteChatById}
                  handleDownloadFile={handleDownloadFile}
                />
              );
            }

            if (friend !== null && chat?.provider === "file") {
              return (
                <FileChat
                  key={uuidv4()}
                  userIdSession={session?.user?.id ?? ""}
                  user={
                    chat?.userId === session?.user?.id ? session?.user : friend
                  }
                  chat={chat}
                  friend={friend}
                  mainRef={mainRef}
                  handleDeleteChatById={handleDeleteChatById}
                  handleDownloadFile={handleDownloadFile}
                />
              );
            }
          })}
        </div>
      </div>
      <div className="absolute w-[100%] h-[100px] bottom-0 px-6 py-4">
        <ChatInput
          friendName={friend?.name ? friend?.name : "undefined"}
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

export default MainChat;
