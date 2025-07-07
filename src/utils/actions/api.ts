"use server";

import { ServerType, UserType } from "@/types";
import axios from "axios";
import { revalidatePath } from "next/cache";

export const getConnectServer = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api`);
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/email/${email}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const createNewUser = async (user: UserType) => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`,
      {
        name: user.name,
        email: user.email,
        password: user.password,
        // avatar: user.avatar,
        provider: user.provider,
        isAdmin: user.isAdmin,
      }
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const loginByEmail = async (user: UserType) => {
  console.log("TEST 0", user);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    const data = await res.json();
    console.log("TEST 1", data);
    return data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err);
    return err?.response?.data;
  }
};

export const createNewServer = async (server: ServerType, pathName: string) => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/create`,
      {
        name: server.name,
        owner: server.ownerId,
        avatar: server.icon,
      }
    );

    revalidatePath(pathName);

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getJoinServerByUserId = async (userId: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/join/server/${userId}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const editUserByUserId = async (user: UserType) => {
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/update/${user.id}`,
      {
        id: user.id,
        ...user,
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getPendingByEmail = async (email: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/pending/${email}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getAllFriendsByEmail = async (email: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/friends/${email}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getAllDirectMessagesByEmail = async (email: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/directmessages/${email}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getUserById = async (id: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/id/${id}`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getAllChatsByUserId = async (userId: string, friendId: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/message/direct`,
      {
        data: {
          userId: userId,
          friendId: friendId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getDetailServerById = async (serverId: string, userId: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/detail/${serverId}`,
      {
        headers: {
          userId: userId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getAllChatsByChannelId = async (
  userId: string,
  channelId: string
) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/channel/chat/${channelId}`,
      {
        headers: {
          userId: userId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getChannelById = async (userId: string, channelId: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/channel/${channelId}`,
      {
        headers: {
          userId: userId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const getServerInviteLink = async (userId: string, serverId: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/invite/${serverId}`,
      {
        headers: {
          userId: userId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const joinServerByInviteLink = async (
  userId: string,
  inviteLink: string
) => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/server/invite`,
      { userId: userId, inviteLink: inviteLink },
      {
        headers: {
          userId: userId,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const adminGetAllUsers = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const adminGetAllServers = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/servers`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const adminGetServersAnalysis = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/servers/analysis`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};

export const adminGetAllChats = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/chats`
    );
    return res.data;
  } catch (err: any) {
    console.log("API CALL ERROR:", err?.response?.data);
    return err?.response?.data;
  }
};
