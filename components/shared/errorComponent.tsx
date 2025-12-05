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
  return (
    <div className="flex flex-col items-center gap-3 pt-8">
      <div className="flex flex-col items-center justify-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg self-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-red-900 font-semibold">An Error Occurred</h3>
        </div>
        <p className="text-sm text-red-800 text-center">{errorMessage}</p>
        <RetryComponent handleRetry={handleRetry} isRetrying={isRetrying} />
      </div>
    </div>
  );
}
