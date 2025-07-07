import { ServerType, ChannelType, UserType } from "@/types";

export const mockServers: ServerType[] = [
  {
    id: "1",
    name: "Gaming Server",
    icon: "🎮",
    ownerId: "1",
    channels: [
      {
        id: "1",
        name: "general",
        type: "text",
        serverId: "1"
      },
      {
        id: "2", 
        name: "voice-chat",
        type: "voice",
        serverId: "1"
      }
    ]
  },
  {
    id: "2",
    name: "Study Group",
    icon: "📚",
    ownerId: "1", 
    channels: [
      {
        id: "3",
        name: "homework",
        type: "text",
        serverId: "2"
      }
    ]
  }
];

export const mockUsers: UserType[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: null
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: null
  }
]; 