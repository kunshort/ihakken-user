// menu-grid.tsx updates
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tag, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MenuItem } from "@/lib/types/interfaces";
import { Category } from "@/lib/utils";
import Image from "next/image";
import { BASE_API_URL } from "@/lib/api/base";

interface MenuGridProps {
  itemsByCategory: Record<string, MenuItem[]>;
  categories: Category[];
  branchId: string;
}

export function MenuGrid({ itemsByCategory, categories, branchId }: MenuGridProps) {
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

  const formatPrepTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    if (categoryId === "uncategorized") return "Other Items";
    
    const findCategory = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    return findCategory(categories)?.name || "Unknown Category";
  };

  // Get all category IDs in display order
  const getCategoryDisplayOrder = (): string[] => {
    const order: string[] = [];
    
    const traverseCategories = (cats: Category[]) => {
      cats.forEach(cat => {
        if (cat.id !== "all" && itemsByCategory[cat.id]?.length > 0) {
          order.push(cat.id);
        }
        if (cat.children) {
          traverseCategories(cat.children);
        }
      });
    };
    
    traverseCategories(categories);
    
    // Add uncategorized at the end
    if (itemsByCategory.uncategorized?.length > 0) {
      order.push("uncategorized");
    }
    
    return order;
  };

  const categoryDisplayOrder = getCategoryDisplayOrder();

  if (categoryDisplayOrder.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No menu items found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categoryDisplayOrder.map((categoryId) => {
        const items = itemsByCategory[categoryId] || [];
        const categoryName = getCategoryName(categoryId);

        return (
          <div key={categoryId} id={`category-${categoryId}`} className="scroll-mt-24">
            {/* CATEGORY HEADER */}
            <div className="mb-6 pb-4 border-b border-teal-200">
              <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                {categoryName}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 ml-5">
                {items.length} item{items.length !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* MENU ITEMS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {items.map((assignment: MenuItem) => {
                const currency = assignment.currency?.[0];
                const currencySymbol = currency
                  ? getCurrencySymbol(currency.code)
                  : "$";
                const price = assignment.customPrice || assignment.menuItem.price;
                const image = assignment.menuItem.images?.[0];
                const imageUrl = image?.startsWith("http")
                  ? image
                  : `${BASE_API_URL}${image}`;

                const prepTime = assignment.menuItem.prepTime;

                return (
                  <Link
                    key={assignment.id}
                    href={`/branch/${branchId}/services/restaurant/${assignment.id}${
                      payload ? `?payload=${payload}` : ""
                    }`}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                      {/* IMAGE */}
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

                      {/* CONTENT */}
                      <CardContent className="p-3 flex-1 flex flex-col">
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

                            <div className="bg-teal-500 text-white px-1 py-1 rounded-full w-20 flex items-center justify-center">
                              <p className="text-xs font-semibold flex items-center gap-1">
                                <span>Time:</span>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MenuGrid;