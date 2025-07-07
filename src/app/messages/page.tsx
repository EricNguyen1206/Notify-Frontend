"use client";

import { loginSuccess } from "@/lib/redux/features/authSlice";
import { useAppDispatch } from "@/lib/redux/hook";
import { useEffect } from "react";

const DirectMessagesPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const username = prompt('enter username');
    const userid = prompt('enter userid');
    if (username && userid) {
      dispatch(loginSuccess({name: username, id: userid, email: "", avatar: ""}));
    }
  }, [])
  return (
    <div className="w-full">
        <h1>JOIN A CHANNEL</h1>
    </div>
  );
};

export default DirectMessagesPage;
