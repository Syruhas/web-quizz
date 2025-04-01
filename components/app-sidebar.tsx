"use client";

import { ChevronDown } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { navigationItems, NavItem } from "@/config/navigation";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

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

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderMenuItem = (item: NavItem) => {
    if ("children" in item) {
      return (
        <SidebarMenuItem key={item.title}>
          <Collapsible
            open={openMenus.includes(item.title)}
            onOpenChange={() => toggleMenu(item.title)}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between">
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openMenus.includes(item.title) ? "transform rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 mt-2 space-y-1">
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
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Web Quizz by Leo, Salomé & Quentin
            <span
              className={`ml-2 text-sm ${
                userRole === "teacher" ? "text-blue-500" : "text-green-500"
              }`}
            >
              ({userRole === "teacher" ? "Teacher" : "Student"})
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedNavItems.map((item) => renderMenuItem(item))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full"
                >
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
