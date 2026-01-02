import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoContentProps {
  message: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyContent({
   message,
   description,
  actionLabel,  
  actionHref,
  onAction,
  }: NoContentProps) {
  return (
    
      <div className="flex flex-col items-center justify-center h-full text-center gap-2 self-center">
        <div className="font-semibold text-foreground">{message}</div>
        <div className="text-muted-foreground">{description}</div>
         
        {actionLabel && actionHref  && (
          <Link href={actionHref}>
            <Button variant="default" size="sm">
              {actionLabel}
            </Button>
          </Link>
            )}
        {actionLabel && onAction && !actionHref && (
          <Button variant="default" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    
  );
}
