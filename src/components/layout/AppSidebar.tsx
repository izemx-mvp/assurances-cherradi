import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageCircle,
  Send,
  ShieldUser,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/stores";
import { can, roleLabels } from "@/lib/permissions";
import type { Resource } from "@/lib/types";

interface Item {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  resource?: Resource;
}

const items: Item[] = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Prospects", url: "/prospects", icon: Users, resource: "prospects" },
  { title: "Campagnes de relance", url: "/campaigns", icon: Send, resource: "campaigns" },
  { title: "Conversations", url: "/conversations", icon: MessageCircle, resource: "conversations" },
  { title: "Utilisateurs", url: "/users", icon: ShieldUser, resource: "users" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { currentRole, currentName, overrides } = useAuth();

  const visible = items.filter((it) => !it.resource || can(currentRole, it.resource, "read", overrides));


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-glow ring-1 ring-white/10">
            <Logo size={34} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate font-display text-lg leading-none">Nexa</div>
              <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-sidebar-primary">
                Assurances · IA
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {currentName
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{currentName}</div>
              <div className="truncate text-xs text-sidebar-foreground/70">
                {roleLabels[currentRole]}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
