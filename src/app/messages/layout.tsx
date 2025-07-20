import type { Metadata } from "next";

import MessagesWebSocketProvider from "@/components/organisms/MessagesWebSocketProvider";
import Sidebar from "@/components/organisms/Sidebar";
import ScreenProvider from "@/components/templates/ScreenProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Notify | Direct Messages",
  description: "Developed by ericnguyen1206",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      user = null;
    }
  }

  if (!user || !user.id) {
    // Optionally, you can redirect to login or show an error here
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Unauthorized. Please log in.</p>
      </div>
    );
  }

  return (
    <ScreenProvider>
      <MessagesWebSocketProvider userId={user.id}>
        <div className="dark:bg-secondary-gray flex h-full">
          <Sidebar />
          <div className="w-full flex overflow-y-auto">
            {children}
          </div>
        </div>
      </MessagesWebSocketProvider>
    </ScreenProvider>
  );
}
