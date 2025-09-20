import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HomeNavLinks = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Login",
    url: "/login",
  },
  {
    name: "Register",
    url: "/register",
  },
  {
    name: "Messages",
    url: "/messages",
  }
];

export const ApplicationFileType: string[] = [
  "docx",
  "xlsx",
  "pdf",
  "vnd.openxmlformats-officedocument.wordprocessingml.document",
  "vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];