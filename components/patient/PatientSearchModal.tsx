import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";
import CustomButton from "../common/CustomButton";
import CustomLayout from "../common/CustomLayout";
import { CustomTable } from "../common/CustomTable";
import FormField from "../form-inputs/FormField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { Label } from "../ui/label";
import {
  ColumnDefWithClass,
  FilterValues,
  OPDType,
} from "@/lib/type";
import { useOpdList } from "@/hooks/query/opd";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { SortableHeader } from "../common/SortableHeader";
import { useProfile } from "@/hooks/query/auth";
import { hasActionPermission } from "@/lib/utils";
import { ActionType, ModuleType } from "@/generated/prisma/enums";

interface Props {
  trigger: React.ReactNode;
  actions: (row: OPDType, setOpen: (open: boolean) => void) => React.ReactNode;
}

const PatientSearchModal = ({ trigger, actions }: Props) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    createdAt: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  });
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const { data: profile } = useProfile(false);

  const { data, isLoading, isError, error } = useOpdList(filters, page, limit);
  const router = useRouter();

  const form = useForm<FilterValues>({
    defaultValues: filters,
  });

  if (!profile) {
    return <div />;
  }

  const handleSubmit = (values: FilterValues) => {
    setPage(1);
    setFilters(values);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {};
    form.reset(clearedFilters);
    setPage(1);
    setFilters(clearedFilters);
  };

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.CREATE,
  );

  const canView =
    hasActionPermission(
      profile?.data,
      ModuleType.OPD_BILL,
      ActionType.CREATE,
    ) ||
    hasActionPermission(
      profile?.data,
      ModuleType.IPD_BILL,
      ActionType.CREATE,
    ) ||
    hasActionPermission(
      profile?.data,
      ModuleType.PATIENT_MASTER,
      ActionType.VIEW,
    );

  const columns: ColumnDefWithClass<OPDType>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Name" column={column} />;
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
      cell: ({ row }) => (
        <span>
          {row.original.patient.firstName} {row.original.patient.lastName}
        </span>
      ),
    },

    {
      accessorKey: "patient.uhid",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Patient UHID" column={column} />;
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
      cell: ({ row }) => row.original.patient.uhid || "-",
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Date" column={column} />;
      },
      cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy hh:mm a"),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "firstName",
      header: "Actions",
      cell: ({ row }) => actions(row.original, setOpen),
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl! border-secondary border-4 bg-white p-0 gap-0"
      >
        <DialogHeader>
          <DialogTitle className="sr-only"></DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <CustomLayout title="Patient Search">
          <div className="space-y-2">
            <Form {...form}>
              <form
                className="grid grid-cols-3 gap-2"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  label="Name"
                  type="text"
                  control={form.control}
                  name="name"
                />
                <FormField
                  label="Patient UHID"
                  type="text"
                  control={form.control}
                  name="uhid"
                />
                <FormField
                  label="Contact No"
                  type="text"
                  control={form.control}
                  name="contactNo"
                />
                <div className="col-span-2 grid grid-cols-5 border border-black/15 rounded-[4px]">
                  <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                    Date Range
                  </Label>
                  <div className="col-span-3">
                    <FormField
                      type="dateRange"
                      control={form.control}
                      name="createdAt"
                      hideError
                      className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {canCreate && (
                    <CustomButton
                      onClick={() => {
                        setOpen(false);
                        router.push("/patient/new");
                      }}
                    >
                      Register New Patient
                    </CustomButton>
                  )}
                  <CustomButton type="submit">Search</CustomButton>
                  <CustomButton
                    type="button"
                    variant="outline"
                    className="bg-white text-primary shadow-none"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </CustomButton>
                </div>
              </form>
            </Form>
            {canView && (
              <div className="col-span-12">
                <CustomTable
                  columns={columns}
                  data={data?.data || []}
                  page={page}
                  total={data?.total}
                  enableSorting
                  handleChangePage={setPage}
                  isLoading={isLoading}
                  limit={limit}
                  handleChangeLimit={setLimit}
                  isError={isError}
                  error={error}
                  getRowId={(item) => String(item.id)}
                />
              </div>
            )}
          </div>
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchModal;
