export interface ServerType {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  channels: ChannelType[];
}

export interface UserType {
  id?: string;
  name?: string;
  email?: string;
  password?: string | null;
  avatar?: string | null;
  provider?: string;
  created?: Date | string;
  isAdmin?: boolean;
}

export interface DirectMessageChatType {
  id?: string;
  user: UserType | any;
  userId?: string;
  friendId?: string;
  text: string;
  type?: string;
  provider?: string;
  url?: string;
  fileName?: string;
  sended?: string;
}

export interface CategoryType {
  id?: string;
  serverId?: string;
  name?: string;
  channels?: ChannelType[];
  created?: string;
}

export interface ChannelType {
  id: string;
  name: string;
  type: 'text' | 'voice';
  serverId: string;
}

export interface ChannelMessageChatType {
  id?: string;
  user: UserType | any;
  serverId?: string;
  channelId?: string;
  text: string;
  type?: string;
  provider?: string;
  url?: string;
  fileName?: string;
  sended?: string;
}
