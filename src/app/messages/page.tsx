"use client";

import { useChannelStore } from "@/store/useChannelStore";
import { useAuthStore } from "@/store/useAuthStore";

const DirectMessagesPage = () => {
  const { channels } = useChannelStore();
  const { user } = useAuthStore();

  return (
    <div className="w-full flex flex-col items-center justify-center h-full text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to Messages{user?.username ? `, ${user.username}!` : '!'}</h1>
        <div className="text-lg text-gray-400">
          {channels.length > 0 ? (
            <p>Select a channel from the sidebar to start messaging</p>
          ) : (
            <p>Loading channels...</p>
          )}
        </div>
        {channels.length > 0 && (
          <div className="text-sm text-gray-500">
            <p>{channels.length} channel{channels.length !== 1 ? 's' : ''} available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesPage;
