"use client";

import FormField from "@/components/form-inputs/FormField";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Control, FieldValues, Path } from "react-hook-form";

type PermissionModule = {
  module: {
    id: number;
    name: string;
  };
  actions: Array<{
    id: number;
    name: string;
    assigned?: boolean;
  }>;
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  permissions: PermissionModule[];
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

const PermissionsSection = <T extends FieldValues>({
  control,
  permissions,
}: Props<T>) => {
  if (!permissions?.length) {
    return null;
  }

  return (
    <div className="col-span-2 space-y-3">
      <Card className="gap-4 border-border/70 bg-linear-to-br from-white via-white to-muted/30 shadow-none">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">Permissions</CardTitle>
          <CardDescription>
            Assign actions module by module. Each card shows only the actions
            available for that module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {permissions.map(({ module, actions }, moduleIndex) => (
            <div
              key={module.id}
              className="rounded-xl border border-border/70 bg-background/80 p-3"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {formatLabel(module.name)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose which actions this role can perform.
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                  {actions.length} actions
                </Badge>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {actions.map((action, actionIndex) => (
                  <div
                    key={action.id}
                    className={cn(
                      "rounded-lg border border-border/60 bg-muted/30 px-3 py-2",
                      "transition-colors hover:bg-muted/60",
                    )}
                  >
                    <FormField
                      type="checkbox"
                      control={control}
                      name={
                        `permissions.${moduleIndex}.actions.${actionIndex}.assigned` as Path<T>
                      }
                      label={formatLabel(action.name)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsSection;
