"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { joinServerByInviteLink } from "@/utils/actions/api";

const ServerInviteLinkPage = () => {
  // const { data: session }: any = useSession();
  const session = {user: {id: "123", name: "John Doe", email: "john.doe@example.com"}}

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const serverId = params["server-id"];

  const handleJoinServerByInviteLink = async () => {
    const res = await joinServerByInviteLink(session?.user?.id, pathname);
    if (res?.message === "Join server by invite link successfully") {
      router.push(`${res?.clientUrl}/dashboard/server/${res?.server?.id}`);
    } else router.push(`${res?.clientUrl}/dashboard/friends`);
  };

  useEffect(() => {
    if (serverId && session?.user?.id) {
      handleJoinServerByInviteLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return <div>Joining server...</div>;
};

export default ServerInviteLinkPage;
