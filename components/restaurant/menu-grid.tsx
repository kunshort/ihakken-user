// menu-grid.tsx updates
"use client";

import { useSearchParams } from "next/navigation";
import { MenuItem } from "@/lib/types/interfaces";
import { Category } from "@/lib/utils";
import { BASE_API_URL } from "@/lib/api/base";
import { MenuItemCard } from "./MenuItemCard";

interface MenuGridProps {
  itemsByCategory: Record<string, MenuItem[]>;
  categories: Category[];
  branchId: string;
}

export function MenuGrid({ itemsByCategory, categories, branchId }: MenuGridProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

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
                // Adapt the data from the API to the format MenuItemCard expects
                const image = assignment.menuItem.images?.[0];
                const cardItem = {
                  id: assignment.id,
                  name: assignment.menuItem.name,
                  shortDescription: assignment.menuItem.shortDescription,
                  price: assignment.customPrice || assignment.menuItem.price,
                  currencyCode: assignment.currency?.[0]?.code || "USD",
                  imageUrl: image?.startsWith("http") ? image : `${BASE_API_URL}${image}`,
                  prepTime: assignment.menuItem.prepTime,
                };

                return (
                  <MenuItemCard
                    key={assignment.id}
                    item={cardItem}
                    branchId={branchId}
                    payload={payload}
                    className="w-full h-full" // Ensure it fills the grid cell
                  />
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