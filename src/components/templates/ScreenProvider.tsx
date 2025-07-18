"use client";

import { useScreenWidth } from "@/hooks/useScreenWidth";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  children?: React.ReactNode;
};

const ScreenProvider = ({ children }: Props) => {
  const screen = useScreenWidth();
  const {user} = useAuthStore();
  
  if (screen < 700 && user) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-primary-purple">
        <p className="text-xl font-bold">App is not available on mobile</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ScreenProvider;
