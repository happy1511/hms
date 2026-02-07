import { User } from "@/lib/type";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const PermissionsBadge = ({
  permissions,
}: {
  permissions: User["permissions"];
}) => {
  return (
    <div className="flex gap-1 items-center">
      {permissions.slice(0, 3).map((permission, index) => {
        const assignedActions = permission.actions;

        return (
          <HoverCard key={index} openDelay={150}>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer capitalize border border-success bg-success px-2 rounded-sm text-white text-tiny">
                {permission.module.name}
              </span>
            </HoverCardTrigger>

            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <p className="font-semibold capitalize text-sm">
                  {permission.module.name} permissions
                </p>

                {assignedActions.length ? (
                  <div className="flex flex-wrap gap-1">
                    {assignedActions.map((action) => (
                      <span
                        key={action.id}
                        className="capitalize border border-primary bg-primary/10 px-2 py-0.5 rounded-sm text-primary text-xs"
                      >
                        {action.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No actions assigned
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}

      {permissions.length > 3 && (
        <span className="capitalize px-2 rounded-sm text-success text-tiny">
          +More
        </span>
      )}
    </div>
  );
};

export default PermissionsBadge;
