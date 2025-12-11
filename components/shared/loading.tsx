// components/ui/loading-spinner.tsx
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}