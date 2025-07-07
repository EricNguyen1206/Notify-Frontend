import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
// import SocketProvider from "@/components/SocketProvider";
import ScreenProvider from "@/components/providers/ScreenProvider";

export const metadata: Metadata = {
  title: "Discord Clone | Direct Messages",
  description: "Developed by minhtrifit",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScreenProvider>
    <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
      <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
        <Sidebar />
        <div className="w-[calc(100vw-320px)] flex overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  </ScreenProvider>
  )
}
