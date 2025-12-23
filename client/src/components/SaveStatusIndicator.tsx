import { memo } from 'react';
import { CheckCircle, Loader2, AlertCircle, Circle } from 'lucide-react';
import type { SaveStatus } from '../lib/storage/types';
import { getSaveStatusText, getSaveStatusColor } from '../hooks/useAutoSave';
import { cn } from '../lib/utils';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  className?: string;
  showText?: boolean;
}

/**
 * Visual indicator for save status
 */
export const SaveStatusIndicator = memo(function SaveStatusIndicator({
  status,
  className,
  showText = true,
}: SaveStatusIndicatorProps) {
  const Icon = getStatusIcon(status);
  const text = getSaveStatusText(status);
  const colorClass = getSaveStatusColor(status);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        colorClass,
        className
      )}
      title={text}
    >
      <Icon
        className={cn(
          'h-4 w-4',
          status === 'saving' && 'animate-spin'
        )}
      />
      {showText && <span>{text}</span>}
    </div>
  );
});

function getStatusIcon(status: SaveStatus) {
  switch (status) {
    case 'saved':
      return CheckCircle;
    case 'saving':
      return Loader2;
    case 'unsaved':
      return Circle;
    case 'error':
      return AlertCircle;
  }
}

export default SaveStatusIndicator;
