import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PatientType } from "@/lib/type";
import CustomLayout from "../common/CustomLayout";
import { format } from "date-fns";
import CustomButton from "../common/CustomButton";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/query/auth";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { hasActionPermission } from "@/lib/utils";
import { formatAddress } from "@/lib/address";

export interface DataViewField<T> {
  key: keyof T;
  label: string;
}

interface PatientViewModalProps {
  data: PatientType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function PatientViewModal({
  data,
  open,
  onOpenChange,
  trigger,
}: PatientViewModalProps) {
  const { data: profile } = useProfile(false);
  const router = useRouter();

  if (!profile) {
    return <div />;
  }

  const canEdit = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.UPDATE,
  );

  const handleEdit = () => {
    onOpenChange?.(false);
    router.push(`/patient/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Eye className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Patient Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
          <CustomLayout
            contentClassName="grid grid-cols-[40%_60%] space-y-1"
            title="Personal"
          >
            <div>Patient UHID</div>
            <div>{data.uhid || "-"}</div>

            <div>Name</div>
            <div>
              {[data.firstName, data.middleName, data.lastName].join(" ")}
            </div>

            <div>DOB</div>
            <div>{format(data.dob, "MMM dd, yyyy")}</div>

            <div>Marital Status</div>
            <div>{data.maritalStatus}</div>

            <div>MLC</div>
            <div>{data.isMlcPatient ? "Yes" : "No"}</div>

            {data.isMlcPatient && (
              <>
                <div>Insurance Type</div>
                <div>{data.mlcInsuranceType || "--"}</div>

                <div>Policy / Card Number</div>
                <div>{data.mlcPolicyOrCardNumber || "--"}</div>
              </>
            )}

            <div>Relation</div>
            <div>
              {data.relations?.map((relation) => (
                <div key={relation.id || relation.name}>
                  {relation.type} of {relation.name}
                </div>
              ))}
            </div>
          </CustomLayout>
          <CustomLayout
            title="Address"
            contentClassName="grid grid-cols-[40%_60%] space-y-1"
          >
            {data.addresses?.map((address) => (
              <React.Fragment key={address.id}>
                <div>{address.type}</div>
                <div>{formatAddress(address)}</div>
              </React.Fragment>
            ))}
          </CustomLayout>
          <CustomLayout
            title="Contact"
            contentClassName="grid grid-cols-[40%_60%] space-y-1"
          >
            {data.contacts?.map((contact) => (
              <React.Fragment key={contact.id}>
                <div>{contact.type}</div>
                <div>{contact.value}</div>
              </React.Fragment>
            ))}
          </CustomLayout>
          {canEdit && (
            <div className="w-full flex justify-center">
              <CustomButton onClick={handleEdit} className="border-none">
                Edit
              </CustomButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
