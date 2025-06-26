
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorDisplayProps {
  scrapeErrors: string[];
  onClearScrapeErrors: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  scrapeErrors,
  onClearScrapeErrors
}) => {
  if (scrapeErrors.length === 0) return null;

  return (
    <Alert className="bg-red-50 border-red-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-1">URL Scraping Errors:</div>
              <ul className="text-sm space-y-1">
                {scrapeErrors.map((error, index) => (
                  <li key={index} className="text-red-700">• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearScrapeErrors}
          className="text-red-600 hover:text-red-800 hover:bg-red-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Alert>
  );
};
