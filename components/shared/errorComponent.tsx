import React from "react";
import { RetryComponent } from "./retryComponent"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorComponentProps {
  errorMessage: string;
  handleRetry: () => void;
  isRetrying?: boolean;
}

export default function ErrorComponent({
  errorMessage,
  handleRetry,
  isRetrying,
}: ErrorComponentProps) {
  console.log("%%%%%%5ErrorComponent rendered", isRetrying);
  return (
    <div className="flex flex-col items-center gap-3 pt-8">
      <div className="flex flex-col items-center justify-center gap-2 p-4 border border-destructive/30 bg-destructive/10 rounded-lg self-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h3 className="text-destructive font-semibold">An Error Occurred</h3>
        </div>
        <p className="text-sm text-destructive/80 text-center">{errorMessage}</p>

        <RetryComponent handleRetry={handleRetry} isRetrying={isRetrying} />
      </div>
    </div>
  );
}
