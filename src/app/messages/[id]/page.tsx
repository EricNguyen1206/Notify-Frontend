"use client";

import ChatHeader from "@/components/molecules/ChatHeader";
import MessageBubble from "@/components/molecules/MessageBubble";
import MessagesSkeleton from "@/components/molecules/MessagesSkeleton";
import MessageInput from "@/components/organisms/MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatPage } from "./action";

const DirectMessagesPage = () => {
  const {
    user,
    channelId,
    containerRef,
    mainRef,
    chats,
    chatsLoading,
    handleSendMessage,
  } = useChatPage();

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <ChatHeader
        id={String(channelId)}
        name={String(channelId)}
        isGroup={true}
        avatar=""
        participantCount={10}
      />

      <ScrollArea ref={containerRef} className="flex-1 p-5">
        {chatsLoading ? (
          <MessagesSkeleton isGroup={true} />
        ) : (
          <div className="space-y-0">
            {chats.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isGroup={true}
                userId={user!.id}
              />
            ))}
            {/* Invisible element to scroll to */}
            <div ref={mainRef} className="h-0" />
          </div>)}
      </ScrollArea>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default DirectMessagesPage;
