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
import { ColumnDefWithClass, FilterValues, PatientType } from "@/lib/type";
import { usePatientsList } from "@/hooks/query/patient";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  findPatientValidator,
  FindPatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { SortableHeader } from "../common/SortableHeader";

interface Props {
  trigger: React.ReactNode;
  actions: (
    row: PatientType,
    setOpen: (open: boolean) => void,
  ) => React.ReactNode;
}

const PatientSearchModal = ({ trigger, actions }: Props) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = usePatientsList(
    filters,
    page,
    limit,
  );
  const router = useRouter();

  const form = useForm<FindPatientValidatorType>({
    resolver: zodResolver(findPatientValidator),
  });

  const handleSubmit = (values: FindPatientValidatorType) => {
    setFilters(values);
  };

  const columns: ColumnDefWithClass<PatientType>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return <SortableHeader<PatientType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return <SortableHeader<PatientType> label="Name" column={column} />;
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
      cell: ({ row }) => (
        <span>
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },

    {
      accessorKey: "uhid",
      header: ({ column }) => {
        return <SortableHeader<PatientType> label="UHID No" column={column} />;
      },
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
                  label="UHID No"
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
                <div className="flex gap-2">
                  <CustomButton onClick={() => router.push("/patient/new")}>
                    Register New Patient
                  </CustomButton>
                  <CustomButton type="submit">Search</CustomButton>
                </div>
              </form>
            </Form>
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
                getRowId={(data) => String(data.id)}
              />
            </div>
          </div>
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchModal;
