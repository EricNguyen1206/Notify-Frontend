"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { usePostAuthLogin } from '@/services/endpoints/auth/auth';
import { useAuthStore } from "@/store/useAuthStore";

const LoginEmailForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser, setIsAuthenticated, setToken } = useAuthStore();
  
  const loginMutation = usePostAuthLogin({
    mutation: {
      onSuccess: (res) => {
        const data = res.data
        // Assuming the response contains a token and user data
        if (!data || !data.token || !data.user) {
          toast.error("Invalid login response");
          return;
        }
        const { token, user } = data;
        
        if (token && user) {
          // Store token in cookie
          document.cookie = `token=${token}; path=/; max-age=${60 * 60}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
          
          // Update Zustand state
          setToken(token);
          setUser({
            id: user.id!,
            email: user.email!,
            username: user.username || ''
          });
          setIsAuthenticated(true);
          
          toast.success("Login successfully");
          router.push("/messages");
        }
      },
      onError: (error) => {
        toast.error("An error occurred during login");
        console.error('Login error:', error);
      }
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <form
      className="flex flex-col gap-5 w-[100%] md:w-auto"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 items-center">
        <h1 className="text-xl font-bold">Welcome back!</h1>
        <p className="text-sm text-gray-400">
          We're so excited to see you again!
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-black text-gray-400">
          EMAIL OR PHONE NUMBER
        </p>
        <input
          className="w-auto md:w-[450px] outline-none p-2 bg-primary-black text-white rounded-md"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-black text-gray-400">PASSWORD</p>
        <input
          className="w-auto md:w-[450px] outline-none p-2 bg-primary-black text-white rounded-md"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Link href={"/forgot-password"}>
        <p className="text-[12px] text-sky-500 hover:underline hover:underline-offset-1">
          Forgot your password?
        </p>
      </Link>
      <button
        type="submit"
        className="bg-primary-purple text-white py-2 rounded-md"
        disabled={loginMutation.isLoading}
      >
        {loginMutation.isLoading ? "Loading..." : "Log In"}
      </button>
      <div className="text-[12px] flex items-center gap-1">
        <p>Need an account?</p>
        <Link href={"/register"}>
          <p className="text-sky-500 hover:underline hover:underline-offset-1">
            Register
          </p>
        </Link>
      </div>
    </form>
  );
};

export default LoginEmailForm;
