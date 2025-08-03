import { EnhancedChannel } from '@/store/useChannelStore'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from '../ui/sidebar'
import ChannelsSkeleton from './ChannelsSkeleton'

type SidebarDirectMessagesProps = {
  items: EnhancedChannel[]
  loading: boolean
}

const SidebarDirectMessages = ({
  items, loading
}: SidebarDirectMessagesProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Direct Messsages</SidebarGroupLabel>
      <SidebarGroupAction>
        <Plus />
      </SidebarGroupAction>
      <SidebarMenu>
        {loading ? (
          <ChannelsSkeleton />
        ) : (items.map((item) => (
          <SidebarMenuItem key={item.id} >
            <Link href={`/messages/${item.id}`} className="flex items-center cursor-pointer transition-colors rounded-md p-2 mb-1">
              <div className="relative mr-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {/* {!chat.isGroup && chat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )} */}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                </div>
              </div>
              {/* {chat.unreadCount && (
        <div className="ml-2">
          <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-xs min-w-[1.25rem] h-5">
            {chat.unreadCount}
          </Badge>
        </div>
      )} */}
            </Link>
          </SidebarMenuItem>
        )))}
      </SidebarMenu>
    </SidebarGroup>


  )
}

export default SidebarDirectMessages
