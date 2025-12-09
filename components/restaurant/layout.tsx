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
import { useDecodePayloadQuery } from "@/lib/api/lodging";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { MenuItem } from "@/lib/types/interfaces";
import { buildCategoryHierarchy } from "@/lib/utils";
import ErrorComponent from "../shared/errorComponent";

interface RestaurantLayoutProps {
  branchId: string;
}

export function RestaurantLayout({ branchId }: RestaurantLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuGridRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const { data: decoded, isLoading: payloadLoading } =
    useDecodePayloadQuery(payload);

  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

  // Effect to detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const serviceId = decoded?.services.find(
    (s: any) => s.serviceType?.toLowerCase() === "restaurant"
  )?.id;

  // Fetch menu items
  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: menuError,
    refetch: refetchMenu,
  } = useGetMenuItemsQuery(serviceId ? { serviceId } : skipToken);

  // Fetch categories separately
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetMenuCategoriesQuery(serviceId ? { serviceId } : skipToken);

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

  // Handle retry for both menu items and categories
  const handleRetry = async () => {
    try {
      await Promise.all([refetchMenu(), refetchCategories()]);
    } catch (error) {
      console.error("Error retrying:", error);
    }
  };

  // Check if we're currently retrying
  const isRetrying = isLoadingMenu || isLoadingCategories;

  // Loading state
  if (payloadLoading || (!serviceId && !payloadLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* DYNAMIC STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        {/* TOP BANNER (Alternating Height) */}
        <div
          className={`relative bg-linear-to-r from-[#004248] to-[#006666] overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? "h-16" : "h-48 md:h-64"
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-4">
            <div className="flex w-full items-center gap-4">
              <Link
                href={`/branch/services/${serviceId}${
                  payload ? `?payload=${payload}` : ""
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
              </Link>

              <h1
                className={`font-bold text-white transition-all duration-300 ease-in-out ${
                  isScrolled ? "text-xl" : "text-2xl md:text-3xl"
                }`}
              >
                Our Restaurant Menu
              </h1>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="border-b border-border px-4 py-4">
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

      {/* LOADING STATE */}
      {(isLoadingMenu || isLoadingCategories) && !menuError && !categoriesError && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {(menuError || categoriesError) && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ErrorComponent
            errorMessage="Failed to load menu items"
            handleRetry={handleRetry}
            isRetrying={isRetrying}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      {!isLoadingMenu && !isLoadingCategories && !menuError && !categoriesError && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:block md:col-span-1">
              {/* Set a fixed top value to prevent jumping during scroll */}
              <div className="bg-linear-to-b from-[#004248] to-transparent rounded-lg p-4 sticky top-[140px]">
                <h2 className="text-sm font-semibold text-[#004248] mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#006666] rounded-full" />
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
              {/* MOBILE SIDEBAR TRIGGER - Sticky container */}
              <div className="sticky top-[140px] z-10 bg-background py-3 -my-3 md:hidden">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#004248] border border-[#006666] hover:bg-[#006666] transition-colors"
                >
                  <Menu className="w-4 h-4 text-[#004248]" />
                  <span className="text-sm font-medium text-white">
                    View Categories
                  </span>
                </button>
              </div>

              <div className="mb-4 mt-6 md:mt-0">
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