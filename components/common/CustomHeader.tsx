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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronDown, KeyRound, LogOut, UserCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn, fullName } from "@/lib/utils";

const CustomHeader = ({
  hideSidebarToggle = false,
}: {
  hideSidebarToggle?: boolean;
}) => {
  const { data: profile } = useProfile();
  const { mutateAsync, isPending } = useLogout();
  const user = profile?.data;
  const displayName = user
    ? user?.preferredName || fullName(user) || user?.name || user?.loginId
    : "Account";
  const subtitle = user?.loginId || user?.userName || "";

  return (
    <header className="h-12 flex items-center justify-between border-b border-border bg-linear-to-r from-background via-white to-muted/40 px-4">
      <div className="flex items-center gap-2 min-w-0">
        {!hideSidebarToggle && <SidebarTrigger className="md:hidden" />}
        <Image
          src="/logo.png"
          alt="Hospital logo"
          width={140}
          height={32}
          className="h-8 w-auto object-contain"
          priority
          unoptimized
        />
      </div>
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
