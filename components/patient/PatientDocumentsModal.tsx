"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePatientDocumentsList } from "@/hooks/query/patient";
import PatientDocumentsTable from "@/components/patient/PatientDocumentsTable";

const PatientDocumentsModal = ({
  open,
  onOpenChange,
  title,
  description,
  opdId,
  ipdId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  opdId?: number;
  ipdId?: number;
}) => {
  const { data, isLoading, isError, error } = usePatientDocumentsList(
    {
      ...(opdId ? { opdId } : {}),
      ...(ipdId ? { ipdId } : {}),
    },
    1,
    50,
    { enabled: open && Boolean(opdId || ipdId) },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <PatientDocumentsTable
          data={data?.data || []}
          total={data?.total}
          limit={50}
          hidePagination
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PatientDocumentsModal;
