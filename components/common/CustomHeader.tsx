"use client";

import { useProfile, useLogout } from "@/hooks/query/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, KeyRound, LogOut, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CustomHeader = () => {
  const { data: profile } = useProfile();
  const { mutateAsync, isPending } = useLogout();
  const user = profile?.data;
  const displayName =
    user?.preferredName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.loginId ||
    "Account";
  const subtitle = user?.loginId || user?.userName || "";

  return (
    <header className="h-12 flex items-center justify-between border-b border-border bg-linear-to-r from-background via-white to-muted/40 px-4">
      {/* <SidebarTrigger /> */}
      <span className="ml-4 text-tiny font-medium text-foreground">
        Hospital Management System
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 min-w-0 gap-2 border-border rounded-full bg-background/80 px-2 shadow-none",
              "hover:bg-accent/60",
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <UserCircle2 className="size-4" />
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-tiny font-medium leading-none">
                {displayName}
              </span>
              <span className="block truncate pt-1 text-[11px] text-muted-foreground leading-none">
                {subtitle}
              </span>
            </span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href="/my-profile" className="text-tiny cursor-pointer">
              <UserCircle2 className="size-3" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="text-tiny cursor-pointer">
              <KeyRound className="size-3" />
              Change Password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="text-tiny"
            disabled={isPending}
            onClick={() => mutateAsync()}
          >
            <LogOut className="size-3" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default CustomHeader;
