"use client";

import PageState from "@/components/common/PageState";

const NoPermission = ({
  message = "You do not have permission to view this page.",
}: {
  message?: string;
}) => {
  return <PageState variant="permission" description={message} className="min-h-40" />;
};

export default NoPermission;
