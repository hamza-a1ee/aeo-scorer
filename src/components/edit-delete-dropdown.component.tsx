import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TVoidCallback } from "@/types/types/common/common.type";

import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

interface Props {
  onEdit: TVoidCallback;
  onDelete: TVoidCallback;
  triggerClassName?: string;
}
export default function EditDeleteDropdown({
  onDelete,
  onEdit,
  triggerClassName,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("", triggerClassName)}>
        <EllipsisVertical className="size-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-max" align="end">
        <DropdownMenuItem
          onClick={onEdit}
          className="text-primary flex items-center gap-x-4 hover:bg-primary/10 hover:text-primary"
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-danger-red flex items-center gap-x-4 hover:bg-danger-red/10 hover:text-danger-red"
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
