import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";

interface TransferDebugInfoProps {
  clubName: string;
  originalCount: number;
  categorizedCounts: {
    confirmedIn: number;
    confirmedOut: number;
    rumors: number;
    total: number;
  };
}

export const TransferDebugInfo: React.FC<TransferDebugInfoProps> = ({
  clubName,
  originalCount,
  categorizedCounts
}) => {
  const duplicatesRemoved = originalCount - categorizedCounts.total;
  
  if (duplicatesRemoved === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-yellow-900/20 rounded border border-yellow-700/50 text-xs">
      <AlertTriangle className="h-3 w-3 text-yellow-400" />
      <span className="text-yellow-300">
        Removed {duplicatesRemoved} duplicate{duplicatesRemoved > 1 ? 's' : ''}
      </span>
      <Badge variant="secondary" className="text-xs">
        {originalCount} → {categorizedCounts.total}
      </Badge>
    </div>
  );
};