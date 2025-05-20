import type { Metadata } from "next";
import DMAuthProvider from "@/components/providers/DMAuthProvider";
import Subslidebar from "@/components/Subslidebar";
import SocketProvider from "@/components/SocketProvider";

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
  <SocketProvider>
  <div className="flex">
    <Subslidebar />
    <DMAuthProvider>{children}</DMAuthProvider>
  </div>
</SocketProvider>)
}
