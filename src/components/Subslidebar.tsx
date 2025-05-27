"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFriendStore, useSocketStore } from "@/lib/store";
import { usePathname, useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import { getSummaryName } from "@/lib/helper";
import { DirectMessageChatType, UserType } from "@/types";
import { GrUser } from "react-icons/gr";
import { BsSpeedometer } from "react-icons/bs";
import { AiOutlineShop } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { MdClear } from "react-icons/md";
import UserProfile from "./UserProfile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { joinChannel } from "@/lib/redux/features/socketSlice"
import { fetchFriends } from "@/lib/redux/features/friendSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hook";
import { RootState } from "@/lib/redux/store";
import { getConnectChannels } from "@/utils/actions/channel";

const Subslidebar = () => {
  const session = {user: {id: "123", name: "John Doe", email: "john.doe@example.com"}}
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state: RootState) => state.friend.friends);
  const router = useRouter();
  const params = useParams<{id: string}>();
  const channelId = params.id
  const category = usePathname().split("/dashboard/")[1]; 
  const [channels, setChannels] = useState<any[]>([])


  const socket = useSocketStore((state) => {
    return state.socket;
  });

  const setPendings = useFriendStore((state) => {
    return state.setPendings;
  });
/** --------------------EVENT HANDLER-------------------- */

  // const updateDirectMessages = useFriendStore((state) => {
  //   return state.updateDirectMessages;
  // });


  const handleGetChannels = async () => {
    try {
      const data = await getConnectChannels();
      console.log("TEST", data);
      setChannels(
        data.map((item : any) => (
          {
            ...item,
          })));
    } catch {
      setChannels([]);
    }
  }

  const handleGetFriendsFromDB = async (userId: string) => {
    dispatch(fetchFriends(userId));
  };

  const handleJoinChannel = async (id: string) => {
    if (id != channelId) {
      dispatch(joinChannel({channelId: id, username: session.user.name, clientId: session.user.id}));
  
      router.push(`/messages/${id}`);
    }
  }

  useEffect(() => {
    handleGetChannels();
  }, [])

  useEffect(() => {
    if (socket) {
      // socket.on(
      //   "get_friend_request",
      //   (rs: { message: string; user: UserType }) => {
      //     const { user }: any = rs;

      //     setPendings(user);
      //   }
      // );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    if (session?.user?.id) {
      handleGetFriendsFromDB(session?.user?.id);
      // handleGetDirectMessagesFromDB();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (socket) {
      // socket.on("new_friend", (rs: { message: string; user: UserType }) => {
      //   if (rs?.message === "You have a new friend") {
      //     toast.info(`You and ${rs?.user?.email} just become a friend`);

      //     if (session?.user?.id) handleGetFriendsFromDB(session?.user?.id);
      //   }
      // });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Receive direct message
  useEffect(() => {
    if (socket) {
      // socket.on(
      //   "receive_direct_message",
      //   (rs: {
      //     message: string;
      //     user: UserType;
      //     friend: UserType;
      //     chat: DirectMessageChatType;
      //   }) => {
          // if (rs?.message === "You have new direct message" && rs?.user) {

          //   socket.emit(
          //     "get_direct_messages",
          //     {
          //       email: session?.user?.email,
          //       prevFriend: rs?.user,
          //     },
          //     (res: { message: string; friends: UserType[] }) => {
          //       if (res?.friends) {
          //         updateDirectMessages(res?.friends);
          //       }
          //     }
          //   );
          // }
      //   }
      // );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleDeleteDirectMessage = (friendEmail: string | undefined) => {
    // TODO: Implement delete direct message
    // router.push("/dashboard/friends");

    // if (socket && session?.user?.email && friendEmail !== undefined) {
    //   socket.emit(
    //     "delete_direct_message",
    //     { ownerEmail: session?.user?.email, friendEmail: friendEmail },
    //     (res: { message: string; friend: UserType }) => {
    //       // console.log("Check delete direct message:", res);
    //       if (
    //         res.message === "Delete direct message, successfully" &&
    //         res?.friend
    //       ) {
    //         filterDirectMessages(res?.friend);
    //       }
    //     }
    //   );
    // }
  };

  const getDirectMessageId = (userId: string | undefined) => {
    // const arr = category.split("/");
    // if (userId !== undefined && arr?.length && arr?.length === 3) {
    //   const id = arr[arr?.length - 1];
    //   if (userId === id) return true;
    //   return false;
    // }
    // return false;
    return true;
  };

  return (
    <div className="relative w-[240px] overflow-x-auto bg-secondary-white dark:bg-primary-gray dark:text-gray-400">
      <div className="px-2 py-3 flex items-center justify-center border border-b-primary-black">
        <input
          className="h-[30px] w-[100%] dark:bg-primary-black pl-4 pr-8 py-2 text-[12px] rounded-md outline-none"
          type="text"
          placeholder="Find or start a conversation"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        {channels?.map((item) => {
          return (
            // <Link key={item.name} href={item.url}>
              <div
              key={item.name}
              onClick={() => handleJoinChannel(item.id)}
                className={`px-2 py-3 rounded-md text-[14px] flex items-center gap-5
                            text-zinc-500 hover:bg-zinc-300 hover:text-primary-black
                            dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white ${
                              category !== undefined &&
                              !category.includes("/messages") &&
                              category?.includes(item.name.toLowerCase()) &&
                              "font-semibold text-zinc-900 dark:text-white bg-primary-white dark:bg-secondary-gray"
                            }`}
              >
                <AiOutlineShop size={25} />
                <p>{item.name}</p>
              </div>
            // </Link>
          );
        })}
      </div>
      <div
        className="w-[100%] mt-5 overflow-y-auto flex items-center justify-between px-6 text-[12px] dark:text-gray-400 font-bold hover:dark:text-gray-300"
      >
        <p>DIRECT MESSAGES</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hover:cursor-pointer">
                <IoMdAdd size={20} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create DM</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col gap-1 px-3 mt-5">
        <div className="w-[100%] max-h-[calc(100vh-380px)] overflow-y-auto">
          {friends?.map((user) => {
            return (
              <div
                key={user?.id}
                className={`group flex items-center justify-between pl-2 pr-4 py-2 rounded-md
                font-semibold hover:text-zinc-900 hover:bg-zinc-300 hover:dark:bg-zinc-700
                hover:text-zinc-900 dark:hover:text-white
                hover:cursor-pointer
                ${
                  getDirectMessageId(user?.id)
                    ? "text-zinc-900 dark:text-white bg-primary-white dark:bg-secondary-gray"
                    : "text-zinc-500 dark:text-zinc-500"
                }`}
              >
                <Link href={`/dashboard/friends/messages/${user?.id}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-[30px] h-[30px]">
                      <AvatarImage
                        src={`${user?.avatar ? user?.avatar : ""}`}
                        alt="avatar"
                      />
                      <AvatarFallback>
                        {user?.name && getSummaryName(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <p
                      className={`text-[13px] font-semibold max-w-[200px]
                        group-hover:text-zinc-900 group-hover:dark:text-white ${
                          getDirectMessageId(user?.id)
                            ? "text-zinc-900 dark:text-white"
                            : "text-zinc-500 dark:text-gray-400"
                        }`}
                    >
                      {user?.name}
                    </p>
                  </div>
                </Link>
                <div
                  className="hover:text-white dark:hover:text-zinc-500"
                  onClick={() => {
                    handleDeleteDirectMessage(user?.email);
                  }}
                >
                  <MdClear />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <UserProfile />
    </div>
  );
};

export default Subslidebar;
