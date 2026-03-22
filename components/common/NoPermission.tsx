"use client";

const NoPermission = ({
  message = "This page does not have to view.",
}: {
  message?: string;
}) => {
  return (
    <div className="border border-red-500 bg-red-50 px-3 py-2 text-tiny text-red-600">
      {message}
    </div>
  );
};

export default NoPermission;
