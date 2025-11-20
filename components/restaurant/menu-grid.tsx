"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tag, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MenuItem } from "@/lib/types/interfaces";
import Image from "next/image";

interface MenuGridProps {
  items: MenuItem[];
  branchId: string;
}

export function MenuGrid({ items, branchId }: MenuGridProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CHF: "CHF",
      XAF: "FCFA",
      USS: "$",
    };
    return symbols[code] || code;
  };

  const hasCustomizations = (item: MenuItem) => {
    return item.customizations?.some(
      (c) =>
        c.ingredientsCustomizations.length > 0 ||
        c.addonsCustomizations.length > 0 ||
        c.complementsCustomizations.length > 0 ||
        c.toppinsCustomizations.length > 0
    );
  };

  const formatPrepTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((assignment: MenuItem) => {
        const currency = assignment.currency?.[0];
        const currencySymbol = currency
          ? getCurrencySymbol(currency.code)
          : "$";
        const price = assignment.customPrice || assignment.menuItem.price;
        const category =
          assignment.menuItem.categories?.[0]?.name || "Uncategorized";
        const image = assignment.menuItem.images?.[0];
        const imageUrl = image.startsWith("http")
          ? image
          : `${"http://192.168.1.55:8001"}${image}`;

        const prepTime = assignment.menuItem.prepTime;

        return (
          <Link
            key={assignment.id}
            href={`/branch/${branchId}/services/restaurant/${assignment.id}${
              payload ? `?payload=${payload}` : ""
            }`}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
              {/* IMAGE SECTION */}
              <div className="relative h-40 overflow-hidden bg-linear-to-br from-teal-100 to-teal-50">
                {image ? (
                  <Image
                    src={imageUrl}
                    alt={assignment.menuItem.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-5xl opacity-20">🍽️</div>
                  </div>
                )}
              </div>
              <CardContent className="p-3 flex-1 flex flex-col mt--2">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2">
                  {assignment.menuItem.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                  {assignment.menuItem.shortDescription}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-lg font-bold text-teal-600">
                      {currencySymbol} {price.toLocaleString()}
                    </p>

                    <div className=" bg-teal-500 text-white px-1 py-1 rounded-full w-20">
                      <p className="text-xs font-semibold flex items-center ">
                        <span className="mr-2">Time:</span>
                        <Clock className="w-3 h-3" />
                        {formatPrepTime(prepTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {items.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      )}
    </div>
  );
}

export default MenuGrid;
