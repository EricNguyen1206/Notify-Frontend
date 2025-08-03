"use client"

import { Hash, Plus } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import ChannelsSkeleton from "./ChannelsSkeleton"

export function SidebarChannels({
  items,
  loading
}: {
  items: any[],
  loading: boolean
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Channels</SidebarGroupLabel>
      <SidebarGroupAction>
        <Plus /> <span className="sr-only">Add Channel</span>
      </SidebarGroupAction>
      <SidebarMenu>
        {loading ? (
          <ChannelsSkeleton />
        ) : (
          items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton tooltip={item.name}>
                <Hash />
                <Link href={`/messages/${item.id}`}>
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
