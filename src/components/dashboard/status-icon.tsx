import { cn } from "@/lib/utils";
import type { Pool, Disk } from "@/lib/types";

type Status = Pool['status'] | Disk['status'];

const statusClasses: Record<Status, string> = {
  online: "bg-primary",
  degraded: "bg-accent",
  faulted: "bg-destructive",
  offline: "bg-muted-foreground",
  unavailable: "bg-muted-foreground",
};

export function StatusIcon({ status }: { status: Status }) {
  return (
    <span className={cn("h-3 w-3 rounded-full shrink-0", statusClasses[status])} />
  );
}
