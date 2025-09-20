"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useChannelStore } from "@/store/useChannelStore";
import { useParams } from "next/navigation";

const DynamicBreadcrumb = () => {
  const params = useParams<{ id: string }>();
  const { groupChannels, directChannels } = useChannelStore();

  const channelId = params.id ? Number(params.id) : undefined;

  // Find the current channel
  const currentChannel = channelId
    ? groupChannels.find((ch) => ch.id === channelId) || directChannels.find((ch) => ch.id === channelId)
    : null;

  // Display channel name if found, otherwise show channel ID
  const displayName = currentChannel?.name || (channelId ? `#${channelId}` : "#channel-id");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/messages" className="font-normal">
            Conversation
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{displayName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadcrumb;
