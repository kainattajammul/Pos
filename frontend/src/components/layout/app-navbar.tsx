"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/ui-slice";
import { useAuth } from "@/hooks/use-auth";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/users/create": "Add user",
  "/users/edit": "Edit user",
  "/roles": "Roles",
  "/roles/create": "Add Role",
  "/customer": "Customers",
  "/products": "Products",
  "/repairs": "Repairs",
  "/settings": "Settings",
};

function resolveNavbarTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/roles/create")) return "Add Role";
  if (pathname.startsWith("/roles/") && pathname.endsWith("/edit")) return "Edit Role";
  if (pathname.startsWith("/roles/")) return "Roles";
  if (pathname.endsWith("/edit")) return "Edit user";
  if (pathname.startsWith("/users/create")) return "Add user";
  if (pathname.startsWith("/users/")) return "Users";
  return "Dashboard";
}

export function AppNavbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const title = resolveNavbarTitle(pathname);
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "FD";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
        >
          <Menu className="size-5" />
        </Button>

        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, repairs..."
              className="h-10 rounded-full border-border/80 bg-muted/40 pl-9"
            />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="size-[18px]" />
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-[18px]" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full p-0 ring-2 ring-primary/20"
                />
              }
            >
              <Avatar className="size-9">
                <AvatarImage src="" alt={user?.email ?? "User"} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{user?.email ?? "Guest"}</p>
                <p className="text-xs font-normal text-muted-foreground capitalize">
                  {user?.role?.toLowerCase().replace("_", " ") ?? "Not signed in"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings">Profile settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
