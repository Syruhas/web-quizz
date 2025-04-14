"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { navigationItems, NavItem } from "@/config/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: false });
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);


  if (status === "loading" || status === "unauthenticated" || !session) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  const userRole = session.user.role;

  const allowedNavItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const renderMenuItem = (item: NavItem) => {
    if ("children" in item) {
      return (
        <div key={item.title}>
          <SidebarMenuItem>
            <div className="flex items-center px-3 py-2">
              <item.icon className="h-4 w-4 mr-2" />
              <span>{item.title}</span>
            </div>
          </SidebarMenuItem>
          <div className="ml-4 space-y-1">
            {item.children?.map((child) => (
              <SidebarMenuItem key={child.title}>
                <SidebarMenuButton
                  asChild
                  className={pathname === child.url ? "bg-accent" : ""}
                >
                  <Link href={child.url}>
                    <child.icon className="h-4 w-4" />
                    <span>{child.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </div>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className={pathname === item.url ? "bg-accent" : ""}
        >
          <Link href={item.url}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-3 py-2">
          <h2 className="text-lg font-semibold">Web Quizz</h2>
          <p className="text-sm">by Leo, Salomé, Quentin</p>
          <p
            className={`text-sm ${
              userRole === "teacher" ? "text-blue-500" : "text-green-500"
            }`}
          >
            Role: {userRole === "teacher" ? "Teacher" : "Student"}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{allowedNavItems.map((item) => renderMenuItem(item))}
            <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full"
                >
                  <LogOutIcon/>
                  <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
