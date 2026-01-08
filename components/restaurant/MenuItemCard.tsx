"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    shortDescription?: string;
    price: number;
    currencyCode: string;
    imageUrl?: string;
    prepTime?: number;
  };
  branchId: string;
  className?: string; 
}

const formatPrepTime = (minutes: number | undefined | null) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, branchId, className }) => {
  const currencySymbol = item.currencyCode;
  const prepTimeFormatted = formatPrepTime(item.prepTime);

  return (
    <Link
      href={`/branch/${branchId}/services/restaurant/${item.id}`}
    >
      <Card
        className={cn(
          "overflow-hidden shadow-sm border-border hover:shadow-md transition-shadow py-0",
          className
        )}>
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-3xl opacity-40">🍽️</div>
            </div>
          )}
        </div>

        <CardContent className="p-2 pt-0 flex flex-col ">
          <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{item.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.shortDescription}</p>
          <div className="flex items-center justify-between text-sm">
            <p className="font-bold text-primary">
              {currencySymbol} {item.price.toFixed(2)}
            </p>
            {prepTimeFormatted && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{prepTimeFormatted}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};