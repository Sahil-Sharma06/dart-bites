import { HTMLAttributes } from "react";
import { cn } from "./utils";

type Status = "pending" | "preparing" | "ready" | "completed";

const statusClasses: Record<Status, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  completed: "bg-slate-100 text-slate-700"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: Status;
};

export function Badge({ className, status, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        status ? statusClasses[status] : "bg-slate-100 text-slate-700",
        className
      )}
      {...props}
    />
  );
}
