"use client";

import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  UserCircle,
  FileText,
  FolderOpen,
  BedDouble,
  UserCheck,
  AlertTriangle,
  DollarSign,
  ChevronDown,
  Stethoscope,
  User,
  Bolt,
  LucideProps,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, hasModulePermission } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/query/auth";
import { ModuleType } from "@/generated/prisma/enums";

interface SidebarItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  module: ModuleType;
}

const opdItems = [
  { title: "PATIENTS (OPD/IPD)", url: "/opd/patients", icon: Users },
  { title: "WALK-IN QUEUE", url: "/opd/walk-in", icon: UserPlus },
  { title: "APPOINTMENTS", url: "/opd/appointments", icon: Calendar },
  { title: "PATIENT PROFILE", url: "/opd/profile", icon: UserCircle },
  { title: "SCANNED REPORTS", url: "/opd/reports", icon: FileText },
  { title: "PATIENT DOCUMENTS", url: "/opd/documents", icon: FolderOpen },
];

const ipdItems = [
  { title: "IN-PATIENTS LIST", url: "/ipd/in-patients", icon: BedDouble },
  { title: "DISCHARGED PATIENTS", url: "/ipd/discharged", icon: UserCheck },
  { title: "PATIENTS (OPD/IPD)", url: "/ipd/patients", icon: Users },
  { title: "MLC PATIENTS", url: "/ipd/mlc", icon: AlertTriangle },
  { title: "PATIENT DOCUMENTS", url: "/ipd/documents", icon: FolderOpen },
];

const financeItems = [
  { title: "BILLING", url: "/finance/billing", icon: FileText },
  { title: "PAYMENTS", url: "/finance/payments", icon: DollarSign },
];

const masters: SidebarItem[] = [
  {
    title: "DOCTORS",
    url: "/doctors",
    icon: Stethoscope,
    module: ModuleType.DOCTOR_MASTER,
  },
  {
    title: "USERS",
    url: "/users",
    icon: User,
    module: ModuleType.USER,
  },
];

export function CustomSidebar() {
  const [opdOpen, setOpdOpen] = useState(true);
  const [ipdOpen, setIpdOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const { data } = useProfile();

  if (!data) {
    return <></>;
  }

  const visibleMasters = masters.filter(
    (item) => hasModulePermission(data.data, item.module)?.length,
  );

  return (
    <Sidebar className="border-r border-sidebar-border top-12 h-[calc(100dvh-48px)] px-2 py-2 bg-primary/10 text-tiny">
      <SidebarHeader className="p-0">
        {/* Dashboard Item */}
        <Link href="/">
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-1.5 h-auto hover:text-white font-semibold transition-colors",
              isActive("/")
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <LayoutDashboard className="size-3" />
            <span>DASHBOARD</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-0 bg-primary/10">
        {/* OPD Section */}
        <Collapsible open={opdOpen} onOpenChange={setOpdOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto hover:text-white text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold text-tiny ">
                <div className="flex items-center gap-3">
                  <Users className="size-3" />
                  <span>OPD</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    opdOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {opdItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny [&>svg]:size-3"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* IPD Section */}
        <Collapsible open={ipdOpen} onOpenChange={setIpdOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto hover:text-white text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold text-tiny">
                <div className="flex items-center gap-3">
                  <BedDouble className="size-3" />
                  <span>IPD</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    ipdOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {ipdItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny [&>svg]:size-3"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Finance Section */}
        <Collapsible open={financeOpen} onOpenChange={setFinanceOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto hover:text-white text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold text-tiny">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-3" />
                  <span>FINANCE</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    financeOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {financeItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny   [&>svg]:size-3"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Master Section */}
        <Collapsible open={masterOpen} onOpenChange={setMasterOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto hover:text-white text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold text-tiny">
                <div className="flex items-center gap-3">
                  <Bolt className="size-3" />
                  <span>MASTERS</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    masterOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleMasters.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny   [&>svg]:size-3"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
