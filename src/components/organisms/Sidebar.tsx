"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetChannels } from "@/services/endpoints/channels/channels";
import { ModelsChannelListResponse } from "@/services/schemas";
import { useAuthStore } from "@/store/useAuthStore";
import { useChannelStore } from "@/store/useChannelStore";
import { useSocketStore } from "@/store/useSocketStore";
import { Plus, Tv } from "lucide-react";
import CreateNewChannelDialog from "./CreateNewChannelDialog";
import UserProfile from "./UserProfile";

const Subslidebar = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const channelId = Number(params.id)
  const pathname = usePathname();

  const [openCreateChannel, setOpenCreateChannel] = useState<boolean>(false);


  /** -------------------- GLOBAL STATE -------------------- */
  const { user } = useAuthStore()
  const { socket } = useSocketStore();
  const { channels, currentChannel, setChannels } = useChannelStore();

  /** -------------------- DATA FETCHING -------------------- */

  // Use react-query to fetch channels
  const { data: channelsData, isLoading: isChannelsLoading, error: channelsError } = useGetChannels();

  /** -------------------- EVENT HANDLER -------------------- */

  // const updateDirectMessages = useFriendStore((state) => {
  //   return state.updateDirectMessages;
  // });



  const handleJoinChannel = async (id: number) => {
    if (id !== channelId && user) {
      if (socket) {
        const joinMsg = {
          action: "join",
          channelId: String(id),
        };
        socket.send(JSON.stringify(joinMsg));
      }
      router.push(`/messages/${id}`);
    }
  }



  const handleDeleteDirectMessage = (messageId: number | undefined) => {
    // TODO: Implement delete direct message
  };

  const getDirectMessageId = (userId: number | undefined) => {
    // Check if the current channel is a direct message with the user
    if (userId && currentChannel) {
      // TODO: Implement logic to check if the current channel is a direct message with the user
      return true;
    }
    return false;
  };


  /** -------------------- LIFE CIRCLE -------------------- */

  useEffect(() => {
    if (channelsData?.data && Array.isArray(channelsData.data)) {
      setChannels(
        channelsData.data.map((ch: ModelsChannelListResponse) => ({
          id: ch.id ?? 0,
          name: ch.name ?? "",
          ownerId: ch.ownerId ?? 0,
          createdAt: ch.createdAt ?? "",
        }))
      );
    } else {
      setChannels([]);
    }
  }, [channelsData, setChannels]);

  useEffect(() => {
    if (user?.id) {
      // TODO: Get direct message from DB
    }
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      // socket.on("new_friend", (rs: { message: string; user: UserType }) => {
      //   if (rs?.message === "You have a new friend") {
      //     toast.info(`You and ${rs?.user?.email} just become a friend`);

      //     if (session?.user?.id) handleGetFriendsFromDB(session?.user?.id);
      //   }
      // });

      // Receive direct message
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
  }, [socket]);

  return (
    <div className="relative w-[240px] overflow-x-auto bg-secondary-white dark:bg-primary-gray dark:text-gray-400">
      <div className="px-2 py-3 flex items-center justify-center border border-b-primary-black">
        <input
          className="h-[30px] w-[100%] dark:bg-primary-black pl-4 pr-8 py-2 text-[12px] rounded-md outline-none"
          type="text"
          placeholder="Find or start a conversation"
        />
      </div>
      <div className="w-[100%] mt-2 flex items-center justify-between px-6 text-[12px] dark:text-gray-400 font-bold hover:dark:text-gray-300">
        <p>CHANNELS</p>
        <div className="text-xs text-gray-500">
          {isChannelsLoading ? "Loading..." : 
            <button className="dark:hover:text-white p-[6px] rounded-md
                        hover:bg-secondary-white hover:text-primary-gray
                        dark:hover:bg-secondary-gray">
              <CreateNewChannelDialog
                  openCreateChannel={openCreateChannel}
                  setOpenCreateChannel={setOpenCreateChannel}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Plus size={20} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create Channel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CreateNewChannelDialog>
            </button>
          }
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3">
        {isChannelsLoading ? (
          <div className="text-center text-gray-500 py-4">Loading channels...</div>
        ) : channelsError ? (
          <div className="text-center text-red-500 py-4">Error loading channels</div>
        ) : channels.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No channels found</div>
        ) : (
          channels.map((item) => {
            return (
              // <Link key={item.name} href={item.url}>
              <div
                key={item.name}
                onClick={() => handleJoinChannel(item.id)}
                className={`px-2 py-3 rounded-md text-[14px] flex items-center gap-5 cursor-pointer
                              text-zinc-500 hover:bg-zinc-300 hover:text-primary-black
                              dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white ${
                                channelId === item.id
                                  ? "font-semibold text-zinc-900 dark:text-white bg-primary-white dark:bg-secondary-gray"
                                  : ""
                              }`}
              >
                <Tv />
                <p>{item.name}</p>
              </div>
              // </Link>
            );
          })
        )}
      </div>
      {/* <div
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
                <Link href={`/`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-[30px] h-[30px]">
                      <AvatarImage
                        src={`${user?.avatar ? user?.avatar : ""}`}
                        alt="avatar"
                      />
                      <AvatarFallback>
                        {user?.name && user.name[0]}
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
      </div> */}
      <UserProfile />
    </div>
  );
};

export default Subslidebar;
