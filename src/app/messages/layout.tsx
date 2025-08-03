import type { Metadata } from "next";

import AppSidebar from "@/components/organisms/AppSidebar";
import ScreenProvider from "@/components/templates/ScreenProvider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { ClientProviders } from "@/components/templates/ClientProviders";
import { cookies } from "next/headers";
import { lazy } from "react";

const MessagesWebSocketProvider = lazy(() => import("@/components/templates/MessagesWebSocketProvider"));

export const metadata: Metadata = {
  title: "Notify | Messages",
  description: "Developed by ericnguyen1206",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      user = null;
    }
  }

  if (!user || !user.id) {
    // Optionally, you can redirect to login or show an error here
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Unauthorized. Please log in.</p>
      </div>
    );
  }

  return (
    <ScreenProvider>
      <ClientProviders userId={user.id}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/messages">
                        Conversation
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>#channel-id</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="w-full h-full flex overflow-y-auto">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ClientProviders>
    </ScreenProvider>
  );
}
