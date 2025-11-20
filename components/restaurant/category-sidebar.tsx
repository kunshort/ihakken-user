"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/lib/types/interfaces";

export interface Category {
  id: string;
  name: string;
  children?: Category[]; // for future nested categories
}

interface CategorySidebarProps {
  menuItems: MenuItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CategorySidebar({
  menuItems,
  selectedCategoryId,
  onSelectCategory,
  onClose,
  isOpen,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["all"])
  );

  // Generate flat unique categories from menuItems
  const categories: Category[] = [
    { id: "all", name: "All Items" },
    ...Array.from(
      new Map(
        menuItems
          .flatMap((item) => item.menuItem.categories)
          .map((c) => [c.id, { id: c.id, name: c.name }])
      ).values()
    ),
  ];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    onClose();
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleCategory(category.id);
            } else {
              handleSelectCategory(category.id);
            }
          }}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
            selectedCategoryId === category.id
              ? "bg-teal-500 text-white shadow-md"
              : "text-foreground hover:bg-white/50"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span>{category.name}</span>
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children!.map((child) =>
              renderCategory(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-linear-to-b from-teal-50 to-white border-r border-border min-h-screen p-4 sticky top-0">
        <h2 className="text-sm font-semibold text-teal-700 flex items-center gap-2 mb-6">
          <div className="w-1 h-4 bg-teal-500 rounded-full" /> Categories
        </h2>
        <div className="space-y-2">
          {categories.map((cat) => renderCategory(cat))}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-linear-to-b from-teal-50 to-white rounded-r-lg p-4 transition-transform duration-300 z-50 md:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-teal-600 flex items-center gap-2">
            <div className="w-1 h-4 bg-teal-500 rounded-full" /> Categories
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {categories.map((cat) => renderCategory(cat))}
        </div>
      </div>
    </>
  );
}

export default CategorySidebar;
