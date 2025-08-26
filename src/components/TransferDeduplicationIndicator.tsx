import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface DeduplicationIndicatorProps {
  originalCount: number;
  deduplicatedCount: number;
  clubName?: string;
}

export const DeduplicationIndicator: React.FC<DeduplicationIndicatorProps> = ({
  originalCount,
  deduplicatedCount,
  clubName
}) => {
  const duplicatesRemoved = originalCount - deduplicatedCount;
  
  if (duplicatesRemoved === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg border">
      <Info className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2 text-sm">
        <span>Removed {duplicatesRemoved} duplicate{duplicatesRemoved > 1 ? 's' : ''}</span>
        {clubName && (
          <Badge variant="secondary" className="text-xs">
            {clubName}
          </Badge>
        )}
        <span className="text-muted-foreground">
          ({originalCount} → {deduplicatedCount} transfers)
        </span>
      </div>
    </div>
  );
};