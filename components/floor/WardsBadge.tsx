import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Ward } from "@/generated/prisma/client";

const WardsBadge = ({ wards }: { wards: Ward[] }) => {
  return (
    <div className="flex items-center gap-1">
      <HoverCard openDelay={150}>
        <HoverCardTrigger asChild>
          {/* SINGLE trigger wrapper */}
          <div className="flex gap-1 cursor-pointer">
            {wards.slice(0, 3).map((ward) => (
              <span
                key={ward.id}
                className="capitalize border border-success bg-success px-2 rounded-sm text-white text-tiny"
              >
                {ward.name}
              </span>
            ))}

            {wards.length > 3 && (
              <span className="capitalize px-2 rounded-sm text-success text-tiny">
                +{wards.length - 3} more
              </span>
            )}
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-64">
          <div className="flex flex-wrap gap-1">
            {wards.map((ward) => (
              <span
                key={ward.id}
                className="capitalize border border-primary bg-primary/10 px-2 py-0.5 rounded-sm text-primary text-xs"
              >
                {ward.name}
              </span>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default WardsBadge;
