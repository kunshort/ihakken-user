"use client"

import { useState } from "react"
import { Search, Filter, ChevronLeft } from 'lucide-react'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CategorySidebar } from "./category-sidebar"
import { MenuGrid } from "./menu-grid"
import { useGetMenuItemsQuery, useGetCategoriesQuery } from "@/lib/api/restaurant"
import { useSearchParams } from 'next/navigation'

// Mock categories for fallback
const mockCategories = [
  {
    id: "all",
    name: "All Items",
    children: [],
  },
  {
    id: "starters",
    name: "Starters",
    children: [
      { id: "starters-hot", name: "Hot Starters", children: [] },
      { id: "starters-cold", name: "Cold Starters", children: [] },
    ],
  },
  {
    id: "mains",
    name: "Main Dishes",
    children: [
      { id: "mains-rice", name: "Rice Dishes", children: [] },
      { id: "mains-grilled", name: "Grilled Items", children: [] },
      { id: "mains-vegetarian", name: "Vegetarian", children: [] },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    children: [
      { id: "desserts-cakes", name: "Cakes", children: [] },
      { id: "desserts-pastries", name: "Pastries", children: [] },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    children: [
      { id: "drinks-hot", name: "Hot Beverages", children: [] },
      { id: "drinks-cold", name: "Cold Beverages", children: [] },
    ],
  },
]

interface RestaurantLayoutProps {
  branchId: string
}

export function RestaurantLayout({ branchId }: RestaurantLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Items")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const payload = searchParams.get('payload') || ''

  // Pass branchId to API queries
  const { data: menuItems = [], isLoading: itemsLoading, error: itemsError } = useGetMenuItemsQuery(branchId)
  const { data: categories = mockCategories, isLoading: categoriesLoading } = useGetCategoriesQuery(branchId)

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All Items" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (itemsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  if (itemsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load menu items</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20">
        <div className="relative h-48 md:h-64 bg-linear-to-r from-teal-600 to-teal-800 overflow-hidden">
          <img src="/modern-restaurant-interior-with-elegant-dining.jpg" alt="Restaurant" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-center gap-4">
              <Link href={`/branch/services${payload ? `?payload=${payload}` : ''}`}>
                <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Our Restaurant Menu</h1>
            </div>
          </div>
        </div>

        {/* Search bar below image */}
        <div className="bg-white border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
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
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.name
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

          {/* Menu Grid */}
          <div className="md:col-span-3">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <MenuGrid items={filteredItems} branchId={branchId} />
          </div>
        </div>
      </div>

      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />
    </div>
  )
}

export default RestaurantLayout