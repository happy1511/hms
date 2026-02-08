import { AppointmentStatus, Status } from "@/generated/prisma/enums";
interface Props {
  status: "success" | "failed" | Status | AppointmentStatus;
}

const errorStatuses = [Status["inactive"], "failed"];

const StatusBadge = ({ status }: Props) => {
  return errorStatuses.includes(status) ? (
    <span className="capitalize border border-destructive bg-destructive px-2 rounded-sm text-white">
      {status}
    </span>
  ) : (
    <span className="capitalize border border-success bg-success px-2 rounded-sm text-white">
      Active
    </span>
  );
};

export default StatusBadge;
