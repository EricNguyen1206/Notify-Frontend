'use client';

import { House } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ThemeToggle } from "../atoms/ThemeToggle";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface MainHeaderClientProps {
  user: any;
}

const MainHeaderClient = ({ user }: MainHeaderClientProps) => {
  const router = useRouter();

  const handleSignOut = () => {
    // You may want to clear the cookie here via an API call or client logic
    toast.success("Sign out successfully");
    router.replace("/login");
  };

  return (
    <div className="flex justify-between items-center py-2 px-4">
      <Link href="/">
        <Button type="button" variant="outline" >
          <House />
          <div className="ml-2">Votify</div>
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user == null ? (
          <Link href={"/login"}>
            <div className="bg-primary-black text-white flex justify-center items-center gap-3 px-6 py-3 rounded-3xl hover:bg-secondary-gray hover:shadow-2xl">
              <p className="font-medium text-[18px]">Login</p>
            </div>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button variant="purple" onClick={handleSignOut}>
                  Log Out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default MainHeaderClient; 