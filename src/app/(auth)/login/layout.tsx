import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discord Clone | Login",
  description: "Developed by EricNguyen",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
