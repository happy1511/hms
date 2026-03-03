"use client";

import { useLogout } from "@/hooks/query/auth";
import CustomButton from "./CustomButton";

const CustomHeader = () => {
  const { mutateAsync, isPending } = useLogout();

  return (
    <header className="h-12 flex items-center justify-between border-b border-border bg-linear-to-r from-background to-white px-4">
      {/* <SidebarTrigger /> */}
      <span className="ml-4 text-sm font-medium text-foreground">
        Hospital Management System
      </span>
      <CustomButton disabled={isPending} onClick={() => mutateAsync()}>
        Logout
      </CustomButton>
    </header>
  );
};

export default CustomHeader;
