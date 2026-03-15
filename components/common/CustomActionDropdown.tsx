import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  items?: DropdownItem[]; // for submenu
}

export interface DropdownGroup {
  label?: string;
  items: DropdownItem[];
}

interface CommonActionDropdownProps {
  triggerLabel?: string;
  groups: DropdownGroup[];
  align?: "center" | "end" | "start";
}

const CustomActionDropdown: React.FC<CommonActionDropdownProps> = ({
  triggerLabel = "Open",
  groups,
  align = "end",
}) => {
  const renderItem = (item: DropdownItem, index: number) => {
    // if item has sub items → render submenu
    if (item.items && item.items.length > 0) {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger className="text-tiny">
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.items.map((subItem, subIndex) => (
                <DropdownMenuItem
                  key={subIndex}
                  disabled={subItem.disabled}
                  onClick={subItem.onClick}
                  className="text-tiny"
                >
                  {subItem.label}
                  {subItem.shortcut && (
                    <DropdownMenuShortcut>
                      {subItem.shortcut}
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    // normal item
    return (
      <DropdownMenuItem
        key={index}
        disabled={item.disabled}
        onClick={item.onClick}
        className="text-tiny"
      >
        {item.label}
        {item.shortcut && (
          <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-tiny py-0 h-auto px-2">
        <Button variant="outline">
          {triggerLabel}
          <ChevronDown className="size-2.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-0 bg-white" align={align}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <DropdownMenuGroup>
              {group.items.map((item, index) => renderItem(item, index))}
            </DropdownMenuGroup>

            {groupIndex !== groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomActionDropdown;
