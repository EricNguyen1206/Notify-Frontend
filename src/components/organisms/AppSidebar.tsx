"use client";

import { useSidebarActions } from "@/app/messages/action";
import { Separator } from "@radix-ui/react-context-menu";
import { Search } from "lucide-react";
import NavUser from "../molecules/NavUser";
import { SidebarChannels } from "../molecules/SidebarChannels";
import SidebarDirectMessages from "../molecules/SidebarDirectMessages";
import { Input } from "../ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";

const AppSidebar = () => {
  // Use centralized business logic from actions
  const {
    searchQuery,
    setSearchQuery,
    filteredChannels,
    filteredDirectMessages,
    isChannelsLoading,
  } = useSidebarActions();

  return (
    <Sidebar className="border-gray-200">
      {/* Search Section*/}
      <SidebarHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 rounded-md"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Channels Section */}
        <SidebarChannels items={filteredChannels} loading={isChannelsLoading} />

        <Separator className="mx-4" />

        {/* Direct Messages Section */}
        <SidebarDirectMessages items={filteredDirectMessages} loading={isChannelsLoading} />
      </SidebarContent>

      {/* User Profile Section */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
