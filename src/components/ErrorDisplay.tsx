import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  troubleshootSteps?: string[];
}

const ErrorDisplay = ({ error, onRetry, isRetrying, troubleshootSteps }: ErrorDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!error) return null;

  const defaultSteps = [
    'Check your internet connection',
    'Verify API keys in Settings',
    'Make sure Ollama is running locally (if using Ollama)',
    'Try switching to a different AI provider',
    'Refresh the page and try again',
  ];

  const steps = troubleshootSteps || defaultSteps;

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="glass-panel-error p-4 space-y-3">
        {/* Error Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Connection Error</p>
            <p className="text-xs text-muted-foreground mt-1 break-words">{error}</p>
          </div>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isRetrying && "animate-spin")} />
            {isRetrying ? 'Retrying...' : 'Auto Troubleshoot & Retry'}
          </button>
        )}

        {/* Troubleshoot Steps */}
        <div className="border-t border-border/30 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Troubleshooting steps</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-terminal-text font-mono">{index + 1}.</span>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
