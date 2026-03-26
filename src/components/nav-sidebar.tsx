"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LayoutTemplate,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Proposals", href: "/proposals", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminOnlyItems = ["/templates"];

export function NavSidebar() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const pathname = usePathname();
  const { signOut } = useClerk();

  const filteredItems = navItems.filter((item) => {
    if (adminOnlyItems.includes(item.href)) {
      return currentUser?.role === "Admin" || currentUser?.role === "BusinessOwner";
    }
    return true;
  });

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            PF
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">ProposalFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.href === "/reminders" && unreadCount && unreadCount > 0 ? (
                    <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {currentUser && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {currentUser.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{currentUser.role}</p>
            </div>
            <button onClick={() => signOut()} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}