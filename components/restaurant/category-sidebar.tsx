"use client"

import { useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  children?: Category[]
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onClose: () => void
  isOpen: boolean
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
  isOpen,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["all"]))

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelectCategory = (category: string) => {
    onSelectCategory(category)
    onClose()
  }

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleCategory(category.id)
            } else {
              handleSelectCategory(category.name)
            }
          }}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
            selectedCategory === category.name
              ? "bg-teal-500 text-white shadow-md"
              : "text-foreground hover:bg-white/50"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span>{category.name}</span>
          {hasChildren && (
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="space-y-1">{category.children!.map((child) => renderCategory(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-teal-50 to-transparent rounded-r-lg p-4 transition-transform duration-300 z-50 md:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-teal-600 flex items-center gap-2">
            <div className="w-1 h-4 bg-teal-500 rounded-full" />
            Categories
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1">{categories.map((category) => renderCategory(category))}</div>
      </div>
    </>
  )
}
