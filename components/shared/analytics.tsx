"use client";

import { useEffect } from "react";
import {
  useLazyGetAccommodationVisitQuery,
  useLazyGetMenuItemVisitQuery,
} from "@/lib/api/services-api";

type EventType = "accommodation_visit" | "menu_item_visit";

interface AnalyticsTrackerProps {
  eventType: EventType;
  resourceId: string;
}

export function AnalyticsTracker({
  eventType,
  resourceId,
}: AnalyticsTrackerProps) {
  const [
    triggerAccommodationVisit,
    { isUninitialized: isAccommodationVisitUninitialized },
  ] = useLazyGetAccommodationVisitQuery();
  const [
    triggerMenuItemVisit,
    { isUninitialized: isMenuItemVisitUninitialized },
  ] = useLazyGetMenuItemVisitQuery();

  useEffect(() => {
    if (!resourceId) return;

    if (eventType === "accommodation_visit" && isAccommodationVisitUninitialized) {
      console.log(`[Analytics] Logging event: ${eventType} for resource: ${resourceId}`);
      triggerAccommodationVisit(resourceId);
    }

    if (eventType === "menu_item_visit" && isMenuItemVisitUninitialized) {
      console.log(`[Analytics] Logging event: ${eventType} for resource: ${resourceId}`);
      triggerMenuItemVisit(resourceId);
    }
  }, [
    eventType,
    resourceId,
    triggerAccommodationVisit,
    isAccommodationVisitUninitialized,
    triggerMenuItemVisit,
    isMenuItemVisitUninitialized,
  ]);

  return null; // This component renders nothing
}