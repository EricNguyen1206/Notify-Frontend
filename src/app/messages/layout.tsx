import type { Metadata } from "next";

import Sidebar from "@/components/Sidebar";
import ScreenProvider from "@/components/providers/ScreenProvider";
import MessagesWebSocketProvider from "@/components/MessagesWebSocketProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Discord Clone | Direct Messages",
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
        <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
          <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
            <Sidebar />
            <div className="w-[calc(100vw-320px)] flex overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </MessagesWebSocketProvider>
    </ScreenProvider>
  );
}
