"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  time: string;
  image: string;
}

interface MenuGridProps {
  items: MenuItem[];
  branchId: string;
}

export function MenuGrid({ items, branchId }: MenuGridProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/branch/services/${branchId}/restaurant/${item.id}${
            payload ? `?payload=${payload}` : ""
          }`}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
            <div className="relative h-32 overflow-hidden bg-muted">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-lg font-bold text-teal-600">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
