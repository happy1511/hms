import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addOptionToParameterValidator,
  AddOptionToParameterValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { useCreateOption, useDeleteOption } from "@/hooks/query/pathology";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomLayout from "@/components/common/CustomLayout";
import { Form } from "@/components/ui/form";
import FormField from "@/components/form-inputs/FormField";
import CustomButton from "@/components/common/CustomButton";
import { ColumnDefWithClass } from "@/lib/type";
import { CustomAlert } from "@/components/common/CustomAlert";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CustomTable } from "@/components/common/CustomTable";
import { ParameterOptions } from "@/generated/prisma/client";

interface Props {
  trigger: React.ReactNode;
  data: { id: number; parameterOptions: ParameterOptions[] };
  testId: number;
}

const Actions = ({
  data,
  testId,
  parameterId,
}: {
  data: ParameterOptions;
  testId: number;
  parameterId: number;
}) => {
  const { mutateAsync: deleteOption, isPending } = useDeleteOption(
    testId,
    parameterId,
  );

  return (
    <>
      <CustomAlert
        triggerButton={
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Trash2 className="size-2 text-destructive" />
          </Button>
        }
        title="Delete Option?"
        description="Are you sure you want to delete it?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() => deleteOption({ optionId: data.id })}
        pending={isPending}
      />
    </>
  );
};
const ParameterOptionsModal = ({ trigger, data, testId }: Props) => {
  const { mutateAsync, isPending } = useCreateOption(testId);

  const form = useForm<AddOptionToParameterValidatorType>({
    defaultValues: { parameterId: data.id },
    resolver: zodResolver(addOptionToParameterValidator),
  });

  const handleSubmit = (values: AddOptionToParameterValidatorType) => {
    mutateAsync(values);
  };

  const columns: ColumnDefWithClass<ParameterOptions>[] = [
    {
      accessorKey: "value",
      header: "Option",
    },

    {
      id: "action1s",
      header: "Delete",
      cell: ({ row }) => (
        <Actions data={row.original} testId={testId} parameterId={data.id} />
      ),
    },
  ];

  return (
    <Dialog>
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
        <CustomLayout
          title="Create Pathology Test"
          contentClassName="space-y-3"
        >
          <Form {...form}>
            <form
              className="grid grid-cols-2 space-x-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                label="Option"
                type="text"
                control={form.control}
                name="value"
                placeholder="Enter Option"
                required
              />

              <div className="col-span-2">
                <CustomButton disabled={isPending} type="submit">
                  Create
                </CustomButton>
              </div>
            </form>
          </Form>
          <CustomTable
            columns={columns}
            data={data.parameterOptions}
            getRowId={(data) => String(data.id)}
            hidePagination
          />
        </CustomLayout>
      </DialogContent>
    </Dialog>
  );
};

export default ParameterOptionsModal;
