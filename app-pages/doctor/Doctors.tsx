"use client";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import { DoctorType, Status } from "@/generated/prisma/enums";
import { useDoctorsList } from "@/hooks/query/doctor";
import {
  ColumnDefWithClass,
  Doctor,
  DoctorFilterValues,
  FilterConfig,
} from "@/lib/type";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = () => {
  const router = useRouter();
  return (
    <>
      <CustomButton onClick={() => router.push("/doctors/new")}>
        New Doctor
      </CustomButton>
    </>
  );
};

const columns: ColumnDefWithClass<Doctor>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return <SortableHeader<Doctor> label="ID" column={column} />;
    },
    cell: ({ row }) => <span>#{row.index + 1}</span>,
    headerClassName: "min-w-15 max-w-20",
    cellClassName: "min-w-15 max-w-20",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <SortableHeader<Doctor> label="Doctor Name" column={column} />;
    },
    cell: ({ row }) => (
      <Link
        href={`/doctors/${row.original.userId}`}
        className="hover:underline"
      >
        {row.original.user.name || "-"}
      </Link>
    ),
    headerClassName: "min-w-50",
    cellClassName: "min-w-50",
  },
  {
    accessorKey: "licenseNumber",
    header: ({ column }) => {
      return <SortableHeader<Doctor> label="License Number" column={column} />;
    },
    cell: ({ row }) => (
      <Link
        href={`/doctors/${row.original.userId}`}
        className="hover:underline"
      >
        {row.original.licenseNumber || "-"}
      </Link>
    ),
    headerClassName: "min-w-50",
    cellClassName: "min-w-50",
  },
  {
    accessorKey: "status",
    header: () => {
      return <button className="flex">Status</button>;
    },
    cell: ({ row }) =>
      row.original.status === "inactive" ? (
        <span className="capitalize border border-destructive bg-destructive/10 px-2 rounded-sm text-destructive">
          InActive
        </span>
      ) : (
        <span className="capitalize border border-success bg-success/10 px-2 rounded-sm text-success">
          Active
        </span>
      ),
    headerClassName: "min-w-20 max-w-30",
    cellClassName: "min-w-20 max-w-30",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <SortableHeader<Doctor> label="Created at" column={column} />;
    },
    cell: ({ row }) => {
      return (
        <div className="flex">
          {row.original.user.createdAt &&
            format(row.original.user.createdAt, "MMM dd, yyyy")}
        </div>
      );
    },
    headerClassName: "min-w-40 max-w-50",
    cellClassName: "min-w-40 max-w-50",
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return <SortableHeader<Doctor> label="Updated at" column={column} />;
    },
    cell: ({ row }) => {
      return (
        <div className="flex">
          {row.original.user.updatedAt &&
            format(row.original.user.updatedAt, "MMM dd, yyyy")}
        </div>
      );
    },
    headerClassName: "min-w-40 max-w-50",
    cellClassName: "min-w-40 max-w-50",
  },
  // {
  //   id: "actions",
  //   header: () => <p>Action</p>,
  //   cell: ({ row }) => (
  //     <div className="flex w-fit cursor-pointer justify-self-end rounded-full gap-2">
  //       {/* <CustomTooltip tooltipText="View Invites" asChild>
  //           <Link
  //             className="bg-muted/10 text-muted rounded-full p-2 md:p-3 cursor-pointer"
  //             href={`/vignettes/${row.original._id}`}
  //             prefetch
  //           >
  //             <Eye className="size-4" />
  //           </Link>
  //         </CustomTooltip> */}

  //       <CustomTooltip tooltipText="Edit" asChild>
  //         <Link
  //           className="bg-muted/10 text-muted rounded-full p-2 md:p-3 cursor-pointer"
  //           href={`/editor/collab-project/${row.original._id}`}
  //           prefetch
  //         >
  //           <Pencil className="size-4" />
  //         </Link>
  //       </CustomTooltip>

  //       <CustomTooltip
  //         tooltipText="Delete"
  //         triggerClasses="bg-destructive/10 text-destructive rounded-full p-2 md:p-3 cursor-pointer"
  //         onClick={() => {
  //           setDeleteModalData(row.original);
  //         }}
  //         disabled={isPending}
  //       >
  //         <Trash2 className="size-4" />
  //       </CustomTooltip>
  //     </div>
  //   ),
  //   headerClassName: "min-w-20 max-w-30",
  //   cellClassName: "min-w-20 max-w-30",
  // },
];

const neededFilters: FilterConfig<DoctorFilterValues>[] = [
  {
    label: "Name",
    valueKey: "name",
    type: "text",
    placeholder: "Search by name here.",
  },
  {
    label: "Status",
    valueKey: "status",
    type: "select",
    placeholder: "Select Status",
    options: Object.values(Status).map((s) => ({
      label: s,
      value: s,
    })),
  },
  {
    label: "Doctor Type",
    valueKey: "doctorType",
    type: "select",
    placeholder: "Select Type",
    options: Object.values(DoctorType).map((s) => ({
      label: s,
      value: s,
    })),
  },
  { label: "Created Date", valueKey: "createdAt", type: "date" },
];

const Doctors = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DoctorFilterValues>({});

  const { data } = useDoctorsList(filters, page, 10);

  return (
    <CustomLayout title="Doctors" buttons={<Buttons />}>
      <CustomFilters<DoctorFilterValues>
        filters={neededFilters}
        onSubmit={setFilters}
      />
      <CustomTable
        columns={columns}
        data={data?.data || []}
        page={page}
        total={data?.total}
        enableSorting
        handleChangePage={setPage}
      />
    </CustomLayout>
  );
};

export default Doctors;
