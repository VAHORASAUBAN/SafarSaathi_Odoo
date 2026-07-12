import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Available: "bg-success/15 text-success border-success/30",
  "On Trip": "bg-info/15 text-info border-info/30",
  Dispatched: "bg-info/15 text-info border-info/30",
  "In Shop": "bg-warning/15 text-warning border-warning/30",
  "Off Duty": "bg-muted text-muted-foreground border-border",
  Draft: "bg-muted text-muted-foreground border-border",
  Retired: "bg-destructive/15 text-destructive border-destructive/30",
  Suspended: "bg-destructive/15 text-destructive border-destructive/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Completed: "bg-success/15 text-success border-success/30",
  Active: "bg-warning/15 text-warning border-warning/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  );
}
