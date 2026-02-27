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
  Layers,
  DoorClosed,
  TestTubes,
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
import PatientSearchModal from "../patient/PatientSearchModal";

interface SidebarItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  module: ModuleType[];
}

const opdItems: SidebarItem[] = [
  {
    title: "PATIENTS (OPD/IPD)",
    url: "/opd/patients",
    icon: Users,
    module: [ModuleType.OPD_BILL],
  },
  {
    title: "WALK-IN QUEUE",
    url: "/opd/walk-in",
    icon: UserPlus,
    module: [ModuleType.OPD_BILL],
  },
  {
    title: "APPOINTMENTS",
    url: "/opd/appointments",
    icon: Calendar,
    module: [ModuleType.APPOINTMENT],
  },
  {
    title: "SCANNED REPORTS",
    url: "/opd/reports",
    icon: FileText,
    module: [ModuleType.APPOINTMENT],
  },
  // { title: "PATIENT DOCUMENTS", url: "/patient/documents", icon: FolderOpen },
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
    module: [ModuleType.DOCTOR_MASTER],
  },
  {
    title: "USERS",
    url: "/users",
    icon: User,
    module: [ModuleType.USER],
  },
  {
    title: "DEPARTMENTS",
    url: "/departments",
    icon: Layers,
    module: [ModuleType.DEPARTMENT_MASTER],
  },
  {
    title: "ROOM TYPE",
    url: "/room-types",
    icon: DoorClosed,
    module: [ModuleType.ROOM_TYPE_MASTER],
  },
  {
    title: "ROOMS",
    url: "/room",
    icon: BedDouble,
    module: [ModuleType.ROOM_MASTER],
  },
  {
    title: "BEDS",
    url: "/beds",
    icon: BedDouble,
    module: [ModuleType.BED_MASTER],
  },
  {
    title: "LOCATIONS",
    url: "/locations",
    icon: BedDouble,
    module: [ModuleType.LOCATION_MASTER],
  },
];

const billingMasters: SidebarItem[] = [
  {
    title: "BILLING SECTIONS",
    url: "/billing-sections",
    icon: Bolt,
    module: [ModuleType.BILLING_SECTION_MASTER],
  },
  {
    title: "SERVICES",
    url: "/services",
    icon: Bolt,
    module: [ModuleType.SERVICE_MASTER],
  },
];

const labMasters: SidebarItem[] = [
  {
    title: "RADIOLOGY TEMPLATES",
    url: "/clinical-tests/radiology-template/new",
    icon: TestTubes,
    module: [ModuleType.RADIOLOGY_TEST_MASTER],
  },
  {
    title: "CLINICAL TESTS",
    url: "/clinical-tests",
    icon: TestTubes,
    module: [
      ModuleType.PATHOLOGY_TEST_MASTER,
      ModuleType.RADIOLOGY_TEST_MASTER,
    ],
  },
];

const pathologyOrders: SidebarItem[] = [
  {
    title: "CLAIMED",
    url: "/pathology/claimed",
    icon: TestTubes,
    module: [ModuleType.PATHOLOGY_ORDER],
  },
  {
    title: "CANCELLED",
    url: "/pathology/cancelled",
    icon: TestTubes,
    module: [ModuleType.PATHOLOGY_ORDER],
  },
  {
    title: "OUTSOURCED",
    url: "/pathology/outsourced",
    icon: TestTubes,
    module: [ModuleType.PATHOLOGY_ORDER],
  },
];

const radiologyOrders: SidebarItem[] = [
  {
    title: "CLAIMED",
    url: "/radiology/claimed",
    icon: TestTubes,
    module: [ModuleType.RADIOLOGY_ORDER],
  },
  {
    title: "CANCELLED",
    url: "/radiology/cancelled",
    icon: TestTubes,
    module: [ModuleType.RADIOLOGY_ORDER],
  },
  {
    title: "OUTSOURCED",
    url: "/radiology/outsourced",
    icon: TestTubes,
    module: [ModuleType.RADIOLOGY_ORDER],
  },
];

export function CustomSidebar() {
  const [opdOpen, setOpdOpen] = useState(true);
  const [ipdOpen, setIpdOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [billingMasterOpen, setBillingMasterOpen] = useState(false);
  const [labMasterOpen, setLabMasterOpen] = useState(false);
  const [radiologyOrderOpen, setRadiologyOrderOpen] = useState(false);
  const [pathologyOrderOpen, setPathologyOrderOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const { data } = useProfile();

  if (!data) {
    return <div />;
  }

  const visibleMasters = masters.filter((item) =>
    hasModulePermission(data.data, item.module),
  );
  const visibleBillingMasters = billingMasters.filter((item) =>
    hasModulePermission(data.data, item.module),
  );
  const visibleLabMasters = labMasters.filter((item) =>
    hasModulePermission(data.data, item.module),
  );
  const visibleOpd = opdItems.filter((item) =>
    hasModulePermission(data.data, item.module),
  );
  const visiblePathologyOrders = pathologyOrders.filter((item) =>
    hasModulePermission(data.data, item.module),
  );
  const visibleRadiologyOrders = radiologyOrders.filter((item) =>
    hasModulePermission(data.data, item.module),
  );

  return (
    <Sidebar className="border-r border-sidebar-border top-12 h-[calc(100dvh-48px)] px-2 py-2 bg-sidebar text-tiny!">
      <SidebarHeader className="p-0">
        {/* Dashboard Item */}
        <Link href="/">
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-1.5 h-auto font-semibold data-[active=true]:text-white hover:text-white transition-colors",
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
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny! ">
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
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleOpd.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny! [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <PatientSearchModal
                    trigger={
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="pl-8 py-1.5 h-auto text-tiny! [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black"
                        >
                          <div>
                            <UserCircle />
                            <span>PATIENT PROFILE</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    }
                    actions={(row) => (
                      <Link
                        className="text-secondary hover:underline text-tiny"
                        href={`/patient/${row.id}`}
                      >
                        Select
                      </Link>
                    )}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* IPD Section */}
        <Collapsible open={ipdOpen} onOpenChange={setIpdOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
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
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {ipdItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny! [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
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
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {financeItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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

        <Collapsible open={labMasterOpen} onOpenChange={setLabMasterOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
                <div className="flex items-center gap-3">
                  <Bolt className="size-3" />
                  <span>LAB MASTER</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    labMasterOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleLabMasters.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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

        <Collapsible
          open={pathologyOrderOpen}
          onOpenChange={setPathologyOrderOpen}
        >
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
                <div className="flex items-center gap-3">
                  <Bolt className="size-3" />
                  <span>PATHOLOGY ORDER</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    pathologyOrderOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visiblePathologyOrders.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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

        <Collapsible
          open={radiologyOrderOpen}
          onOpenChange={setRadiologyOrderOpen}
        >
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
                <div className="flex items-center gap-3">
                  <Bolt className="size-3" />
                  <span>RADIOLOGY ORDER</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    radiologyOrderOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleRadiologyOrders.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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
        <Collapsible
          open={billingMasterOpen}
          onOpenChange={setBillingMasterOpen}
        >
          <SidebarGroup className="p-0">
            <CollapsibleTrigger className="w-full bg-transparent">
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
                <div className="flex items-center gap-3">
                  <Bolt className="size-3" />
                  <span>BILLING</span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    billingMasterOpen ? "rotate-180" : "",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleBillingMasters.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-1.5 h-auto text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer font-semibold data-[active=true]:text-white hover:text-white text-tiny!">
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
            <CollapsibleContent className="bg-background">
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {visibleMasters.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="pl-8 py-1.5 h-auto text-tiny!   [&>svg]:size-3 font-semibold data-[active=true]:text-white hover:text-white text-black hover:text0white"
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
