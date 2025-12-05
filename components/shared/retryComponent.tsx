import { Button } from "../ui/button";

export function RetryComponent({
  handleRetry,
  isRetrying = false,
}: {
  handleRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div>
      <Button
        onClick={handleRetry}
        disabled={isRetrying}
        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRetrying ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Retrying...
          </>
        ) : (
          "Retry"
        )}
      </Button>
    </div>
  );
}
