import { Message } from "@/store/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function MessageBubble({ message, isGroup, userId }: { message: Message; isGroup: boolean, userId: number }) {
  if (message.senderId == userId) {
    // Sent messages (right side)
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-indigo-600 text-white rounded-lg rounded-br-sm px-4 py-2">
            <p className="break-words">{message.text}</p>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  // Received messages (left side)
  return (
    <div className="flex items-start mb-4">
      {isGroup && (
        <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-indigo-600 text-white">{message.senderName?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
        </Avatar>
      )}
      <div className="max-w-xs lg:max-w-md">
        {isGroup && (
          <p className="text-sm font-medium text-gray-900 mb-1">{message.senderName ?? "Sender"}</p>
        )}
        <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-4 py-2">
          <p className="text-gray-900 break-words">{message.text}</p>
        </div>
        <div className="flex justify-start mt-1">
          <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}