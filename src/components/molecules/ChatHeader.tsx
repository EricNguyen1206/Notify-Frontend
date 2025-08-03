
import { Phone, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface ChatHeaderProps {
  id: string
  name: string
  avatar: string
  isGroup: boolean
  participantCount?: number
  isOnline?: boolean
}

export default function ChatHeader(chat: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-white border-b border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={chat.avatar} />
          <AvatarFallback>{chat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium text-gray-900">{chat.name}</h2>
          {chat.isGroup ? (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Users className="w-3 h-3" />
              <span>{chat.participantCount} members</span>
            </div>
          ) : (
            <p className="text-sm text-green-600">{chat.isOnline ? 'Online' : 'Offline'}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 cursor-not-allowed">
          <Phone className="w-4 h-4 text-gray-600" />
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 cursor-not-allowed">
          <Video className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    </div>
  )
}