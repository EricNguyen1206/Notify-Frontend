"use client";

import { FaMicrophone } from "react-icons/fa6";
import { IoHeadsetSharp } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";

import { getSummaryName } from "@/lib/helper";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserSettingDialog from "./UserSettingDialog";

const UserProfile = () => {
  // const { data: session, update }: any = useSession();
  const session = {user: {id: "123", name: "John Doe", email: "john.doe@example.com", mute: false, deafen: false, avatar: "https://i.pravatar.cc/150?img=1"}}

  const update = (payload: any) => {
    console.log("update", payload);
  }

  const updateMuteSession = async () => {
    await update({
      ...session,
      user: {
        ...session?.user,
        mute: !session?.user?.mute,
      },
    });
  };

  const updateDeafenSession = async () => {
    await update({
      ...session,
      user: {
        ...session?.user,
        deafen: !session?.user?.deafen,
      },
    });
  };

  return (
    <div className="absolute bottom-0 w-[100%] bg-primary-white dark:bg-primary-black">
      {session?.user === null ? (
        <p className="text-secondary-gray">user undefined</p>
      ) : (
        <div className="flex items-center gap-[5px] p-[5px] text-[12px]">
          <div
            className="p-2 rounded-md flex items-center gap-3
                        hover:bg-secondary-white
                        hover:cursor-pointer dark:hover:bg-secondary-gray"
          >
            <Avatar className="w-[30px] h-[30px]">
              <AvatarImage src={`${session?.user?.avatar}`} alt="@shadcn" />
              <AvatarFallback>
                {session?.user?.name && getSummaryName(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="w-[70px] truncate font-bold">
                {session?.user?.name}
              </p>
              <p className="font-semibold text-[11px] text-green-500">
                {session?.user?.name && "Online"}
              </p>
            </div>
          </div>
          <div className="flex flex-1 justify-end">
            <UserSettingDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="dark:hover:text-white p-[6px] rounded-md
                        hover:bg-secondary-white hover:text-primary-gray
                        dark:hover:bg-secondary-gray"
                    >
                      <IoMdSettings size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>user settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </UserSettingDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
