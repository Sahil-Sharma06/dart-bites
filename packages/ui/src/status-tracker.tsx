import { cn } from "./utils";

type OrderStatus = "pending" | "preparing" | "ready" | "completed";

const steps: OrderStatus[] = ["pending", "preparing", "ready", "completed"];

export function StatusTracker({ status }: { status: OrderStatus }) {
  const activeIdx = steps.indexOf(status);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={cn(
              "h-2 flex-1 rounded-full",
              idx <= activeIdx ? "bg-orange-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-600">
        {steps.map((step) => (
          <span key={step} className="capitalize">
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
