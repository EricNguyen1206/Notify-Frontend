import ScreenProvider from "@/components/providers/ScreenProvider";
import ChannelMemberSlidebar from "@/components/channel/ChannelMemberSlidebar";
import ChannelSubSlidebar from "@/components/channel/ChannelSubSlidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discord Clone | Channel",
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
      {/* <SocketProvider> */}
      <div className="dark:bg-secondary-gray flex h-screen max-h-screen">
        <ChannelSubSlidebar />
        <div className="w-[calc(100vw-320px)] flex overflow-y-auto">
          {children}
          <div
            className={`hidden h-screen border-2 border-l-primary-white dark:border-l-primary-gray min-[900px]:flex w-[300px]`}
          >
            <ChannelMemberSlidebar />
          </div>
        </div>
      </div>
    {/* </SocketProvider> */}
    </div>
  </ScreenProvider>

  );
}
