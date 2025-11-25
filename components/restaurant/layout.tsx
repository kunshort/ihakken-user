// layout.tsx updates
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategorySidebar } from "./category-sidebar";
import type { Category } from "@/lib/utils";
import { MenuGrid } from "./menu-grid";
import {
  useGetMenuItemsQuery,
  useGetMenuCategoriesQuery,
} from "@/lib/api/restaurant";
import { useSearchParams } from "next/navigation";
import { useDecodedPayload } from "@/hooks/useDecodedPayload";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { MenuItem } from "@/lib/types/interfaces";
import { buildCategoryHierarchy } from "@/lib/utils";

interface RestaurantLayoutProps {
  branchId: string;
}

export function RestaurantLayout({ branchId }: RestaurantLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuGridRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const { data: decoded, loading: payloadLoading } = useDecodedPayload(payload);

  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

  const serviceId = decoded?.services.find(
    (s: any) => s.service_type.toLowerCase() === "restaurant"
  )?.id;

  // Fetch menu items
  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: isErrorMenu,
  } = useGetMenuItemsQuery(serviceId ? { serviceId } : skipToken);

  // Fetch categories separately
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetMenuCategoriesQuery(serviceId ? { serviceId } : skipToken);

  const menuItemsRaw: MenuItem[] = menuData?.data || [];
  const rawCategories = categoriesData || [];

  // Build hierarchical categories
  const categories: Category[] = useMemo(() => {
    if (!rawCategories || rawCategories.length === 0) {
      return [{ id: "all", name: "All Items" }];
    }
    return buildCategoryHierarchy(rawCategories);
  }, [rawCategories]);

  // Group menu items by category for the grid
  const menuItemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};

    // Initialize with all categories
    categories.forEach((cat) => {
      if (cat.id !== "all") {
        grouped[cat.id] = [];
      }
    });

    // Add "uncategorized" group
    grouped["uncategorized"] = [];

    // Assign items to categories
    menuItemsRaw.forEach((item) => {
      const itemCategories = item.menuItem.categories || [];

      if (itemCategories.length > 0) {
        itemCategories.forEach((cat) => {
          if (!grouped[cat.id]) {
            grouped[cat.id] = [];
          }
          grouped[cat.id].push(item);
        });
      } else {
        grouped["uncategorized"].push(item);
      }
    });

    // Filter out empty categories
    Object.keys(grouped).forEach((catId) => {
      if (grouped[catId].length === 0 && catId !== "uncategorized") {
        delete grouped[catId];
      }
    });

    return grouped;
  }, [menuItemsRaw, categories]);

  // Handle category selection - scroll to section
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    if (categoryId === "all") {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to the category section
      const element = document.getElementById(`category-${categoryId}`);
      if (element && menuGridRef.current) {
        const offset = 100; // Account for sticky header
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      }
    }

    setIsSidebarOpen(false);
  };

  // Filter items for search only
  const filteredItemsByCategory = useMemo(() => {
    if (!searchQuery) return menuItemsByCategory;

    const filtered: Record<string, MenuItem[]> = {};

    Object.entries(menuItemsByCategory).forEach(([categoryId, items]) => {
      const filteredItems = items.filter((assignment) => {
        const name = assignment.menuItem.name || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      if (filteredItems.length > 0) {
        filtered[categoryId] = filteredItems;
      }
    });

    return filtered;
  }, [menuItemsByCategory, searchQuery]);

  if (payloadLoading || (!serviceId && !payloadLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TOP BANNER + SEARCH */}
      <div className="sticky top-0 z-20">
        <div className="relative h-48 md:h-64 bg-linear-to-r from-teal-600 to-teal-800 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/branch/services/${serviceId}${
                  payload ? `?payload=${payload}` : ""
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
              </Link>

              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Our Restaurant Menu
              </h1>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* LOADING & ERROR STATES */}
      {(isLoadingMenu || isLoadingCategories) && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      )}
      {isErrorMenu && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-destructive">Failed to load menu items</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!isLoadingMenu && !isErrorMenu && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:block md:col-span-1">
              <div className="bg-linear-to-b from-teal-50 to-transparent rounded-lg p-4 sticky top-24">
                <h2 className="text-sm font-semibold text-teal-600 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-teal-500 rounded-full" />
                  View Categories
                </h2>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelectCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategoryId === category.id
                          ? "bg-teal-500 text-white shadow-md"
                          : "text-foreground hover:bg-white/50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MENU GRID */}
            <div className="md:col-span-3" ref={menuGridRef}>
              {/* MOBILE SIDEBAR TRIGGER */}
              <div className="mb-6 flex items-center gap-2 md:hidden">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <Menu className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">
                    View Categories
                  </span>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Search results" : "Browse our menu"}
                </p>
              </div>

              <MenuGrid
                itemsByCategory={filteredItemsByCategory}
                categories={categories}
                branchId={branchId}
              />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR */}
      <CategorySidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />
    </div>
  );
}

export default RestaurantLayout;
