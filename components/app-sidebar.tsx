"use client";

import { FileText, Home, ChartColumn, Settings, Users, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { navigationItems } from "@/config/navigation";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
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

  if (!session) {
    router.push("/login");
    return null;
  }

  const userRole = session.user.role;

  const allowedNavItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Web Quizz by Leo, Salomé & Quentin
            <span 
              className={`ml-2 text-sm ${
                userRole === "teacher" 
                  ? "text-blue-500" 
                  : "text-green-500"
              }`}
            >
              ({userRole === "teacher" ? "Teacher" : "Student"})
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedNavItems.map((item) => (
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
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
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
