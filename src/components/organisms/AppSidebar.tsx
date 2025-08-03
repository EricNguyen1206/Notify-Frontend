"use client";

import { useEffect, useMemo, useState } from "react";

import { useGetChannels } from "@/services/endpoints/channels/channels";
import { EnhancedChannel, useChannelStore } from "@/store/useChannelStore";
import { Separator } from "@radix-ui/react-context-menu";
import { Search } from "lucide-react";
import NavUser from "../molecules/NavUser";
import { SidebarChannels } from "../molecules/SidebarChannels";
import SidebarDirectMessages from "../molecules/SidebarDirectMessages";
import { Input } from "../ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";

const AppSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openCreateChannel, setOpenCreateChannel] = useState<boolean>(false);

  /** -------------------- GLOBAL STATE -------------------- */
  const { groupChannels, directChannels, currentChannel, setGroupChannels, setDirectChannels } = useChannelStore();
  const filteredChannels = useMemo(() => groupChannels.filter(chan =>
    chan.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [groupChannels])

  const filteredDirectMessages = useMemo(() => directChannels.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [directChannels])

  /** -------------------- DATA FETCHING -------------------- */

  // Use react-query to fetch channels
  const { data: channelsData, isLoading: isChannelsLoading, error: channelsError } = useGetChannels();

  /** -------------------- EVENT HANDLER -------------------- */

  /** -------------------- LIFE CIRCLE -------------------- */

  useEffect(() => {
    if (channelsData?.data) {
      setGroupChannels(
        (channelsData.data).group?.map((ch) => ({
          id: ch.id ?? 0,
          name: ch.name,
          ownerId: ch.ownerId,
          createdAt: new Date(),
          type: ch.type,
          avatar: "",
          lastActivity: new Date(),
          unreadCount: 0,
          members: [],
        } as EnhancedChannel)) ?? []
      );
      setDirectChannels(
        (channelsData.data).direct?.map((ch) => ({
          id: ch.id ?? 0,
          name: ch.name,
          ownerId: ch.ownerId,
          createdAt: new Date(),
          type: ch.type,
          avatar: ch.avatar,
          lastActivity: new Date(),
          unreadCount: 0,
          members: [],
        } as EnhancedChannel)) ?? []
      );
    } else {
      setGroupChannels([]);
    }
  }, [channelsData]);

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
