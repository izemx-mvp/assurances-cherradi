import { Bell, LogOut, Search, User as UserIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/stores";
import { roleLabels } from "@/lib/permissions";
import { toast } from "sonner";

export function AppHeader() {
  const { currentName, currentRole, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté");
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un prospect, une campagne…"
          className="border-transparent bg-muted/60 pl-9 focus-visible:border-ring focus-visible:bg-card"
        />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("3 prospects qualifiés aujourd'hui")}>
              3 prospects qualifiés aujourd'hui
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Campagne Auto — 214 clics")}>
              Campagne Auto — 214 clics cette semaine
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Yassine a repris 2 conversations")}>
              Yassine a repris 2 conversations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {currentName
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-medium leading-tight">{currentName}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {roleLabels[currentRole]}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.success("Profil ouvert")}>
              <UserIcon className="mr-2 h-4 w-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

        </DropdownMenu>
      </div>
    </header>
  );
}
