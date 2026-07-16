import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProspectStatus } from "@/lib/types";

export const statusLabels: Record<ProspectStatus, string> = {
  nouveau: "Nouveau",
  en_qualification: "En qualification",
  qualifie: "Qualifié",
  converti: "Converti",
  perdu: "Perdu",
};

const styles: Record<ProspectStatus, string> = {
  nouveau: "bg-info/15 text-info-foreground border-info/30",
  en_qualification: "bg-warning/15 text-warning-foreground border-warning/30",
  qualifie: "bg-primary/15 text-primary border-primary/30",
  converti: "bg-success/20 text-success-foreground border-success/30",
  perdu: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: ProspectStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
