import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCreateOption, useDeleteOption } from "@/hooks/query/pathology";
import { ColumnDefWithClass, PathologyTestDataType } from "@/lib/type";
import {
  addOptionToParameterValidator,
  AddOptionToParameterValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type ParameterOptionItem = PathologyTestDataType["parameters"][number]["parameterOptions"][number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: { id: number; parameterOptions: ParameterOptionItem[] };
  testId: number;
}

const Actions = ({
  data,
  testId,
  parameterId,
}: {
  data: ParameterOptionItem;
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
const ParameterOptionsModal = ({ open, onOpenChange, data, testId }: Props) => {
  const { mutateAsync, isPending } = useCreateOption(testId);

  const form = useForm<AddOptionToParameterValidatorType>({
    defaultValues: { parameterId: data.id },
    resolver: zodResolver(addOptionToParameterValidator),
  });

  useEffect(() => {
    form.reset({ parameterId: data.id, value: "" });
  }, [data.id, form]);

  const handleSubmit = async (values: AddOptionToParameterValidatorType) => {
    await mutateAsync(values);
    form.reset({ parameterId: data.id, value: "" });
  };

  const columns: ColumnDefWithClass<ParameterOptionItem>[] = [
    {
      accessorKey: "value",
      header: "Option",
    },

    {
      id: "options-delete",
      header: "Delete",
      cell: ({ row }) => (
        <Actions data={row.original} testId={testId} parameterId={data.id} />
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-4xl! border-secondary border-4 bg-white p-0 gap-0"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Parameter Options</DialogTitle>
          <DialogDescription className="sr-only">
            Manage options for this parameter
          </DialogDescription>
        </DialogHeader>
        <CustomLayout
          title="Parameter Options"
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
                <CustomButton isLoading={isPending} type="submit">
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
