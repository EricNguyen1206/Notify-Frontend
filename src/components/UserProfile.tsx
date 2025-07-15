"use client";

import { Settings } from 'lucide-react';

import { getSummaryName } from "@/lib/helper";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserSettingDialog from "./UserSettingDialog";
import { useAuthStore } from "@/store/useAuthStore";

const UserProfile = () => {
  const user = useAuthStore((state) => state.user);

  const update = (payload: any) => {
    console.log("update", payload);
  }

  return (
    <div className="absolute bottom-0 w-[100%] bg-primary-white dark:bg-primary-black">
      {user === null ? (
        <p className="text-secondary-gray">user undefined</p>
      ) : (
        <div className="flex items-center gap-[5px] p-[5px] text-[12px]">
          <div
            className="p-2 rounded-md flex items-center gap-3
                        hover:bg-secondary-white
                        hover:cursor-pointer dark:hover:bg-secondary-gray"
          >
            <Avatar className="w-[30px] h-[30px]">
              <AvatarImage src={`${user?.avatar}`} alt="@shadcn" />
              <AvatarFallback>
                {user?.username && getSummaryName(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="w-[70px] truncate font-bold">
                {user?.username}
              </p>
              <p className="font-semibold text-[11px] text-green-500">
                {user?.username && "Online"}
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
                      <Settings size={20} />
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
