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
  Zap,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { ContactQuickAdd } from "@/components/contact-quick-add";
import { GlobalSearch } from "@/components/global-search";

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
      <SidebarHeader className="p-5 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground tracking-tight">ProposalFlow</span>
            <span className="text-[10px] text-sidebar-foreground/60 font-medium uppercase tracking-widest">Sales CRM</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="px-2 mb-3">
          <GlobalSearch />
        </div>
        <div className="px-2 mb-2">
          <ContactQuickAdd />
        </div>
        <SidebarMenu className="space-y-0.5">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  className={
                    isActive
                      ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-600 rounded-l-none font-medium dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-400"
                      : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent rounded-l-none"
                  }
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                  <span>{item.label}</span>
                  {item.href === "/reminders" && unreadCount && unreadCount > 0 ? (
                    <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 min-w-[20px] justify-center font-semibold">
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
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-border">
              <AvatarImage src={currentUser.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-semibold">
                {currentUser.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate font-medium">{currentUser.role}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sidebar-foreground/40 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
