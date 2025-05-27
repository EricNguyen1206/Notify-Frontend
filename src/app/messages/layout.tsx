import type { Metadata } from "next";
import DMAuthProvider from "@/components/providers/DMAuthProvider";
import Subslidebar from "@/components/Subslidebar";
// import SocketProvider from "@/components/SocketProvider";
import ScreenProvider from "@/components/providers/ScreenProvider";
import Slidebar from "@/components/Slidebar";

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
      <Slidebar />
      <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
        <Subslidebar />
        <div className="w-[calc(100vw-320px)] flex overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  </ScreenProvider>
  )
}
