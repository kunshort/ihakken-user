"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategorySidebar, Category } from "./category-sidebar";
import { MenuGrid } from "./menu-grid";
import { useGetMenuItemsQuery } from "@/lib/api/restaurant";
import { useSearchParams } from "next/navigation";
import { useDecodedPayload } from "@/hooks/useDecodedPayload";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { MenuItem } from "@/lib/types/interfaces";

interface RestaurantLayoutProps {
  branchId: string;
}

export function RestaurantLayout({ branchId }: RestaurantLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    (s) => s.service_type.toLowerCase() === "restaurant"
  )?.id;

  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: isErrorMenu,
  } = useGetMenuItemsQuery(serviceId ? { serviceId } : skipToken);

  const menuItemsRaw: MenuItem[] = menuData?.data || [];

  // Generate unique categories from menuItem.categories
  const categories: Category[] = useMemo(() => {
    const catMap: Record<string, string> = {};
    menuItemsRaw.forEach((assignment) => {
      assignment.menuItem.categories?.forEach((c) => {
        if (!catMap[c.id]) catMap[c.id] = c.name;
      });
    });
    const categoryList = Object.entries(catMap).map(([id, name]) => ({
      id,
      name,
    }));
    return [{ id: "all", name: "All Items" }, ...categoryList];
  }, [menuItemsRaw]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItemsRaw.filter((assignment) => {
      const name = assignment.menuItem.name || "";

      const matchesCategory =
        selectedCategoryId === "all" ||
        assignment.menuItem.categories?.some((c) => c.id === selectedCategoryId);

      const matchesSearch = name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [menuItemsRaw, selectedCategoryId, searchQuery]);

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
          <img
            src="/modern-restaurant-interior-with-elegant-dining.jpg"
            alt="Restaurant"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/branch/services${payload ? `?payload=${payload}` : ""}`}
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
      {isLoadingMenu && (
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
                      onClick={() => setSelectedCategoryId(category.id)}
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
            <div className="md:col-span-3">
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
                  Showing {filteredItems.length} item
                  {filteredItems.length !== 1 ? "s" : ""}
                </p>
              </div>

              <MenuGrid items={filteredItems} branchId={branchId} />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR */}
      <CategorySidebar
  menuItems={menuItemsRaw}
  selectedCategoryId={selectedCategoryId}
  onSelectCategory={(id: string) => setSelectedCategoryId(id)}
  onClose={() => setIsSidebarOpen(false)}
  isOpen={isSidebarOpen}
/>


    </div>
  );
}

export default RestaurantLayout;