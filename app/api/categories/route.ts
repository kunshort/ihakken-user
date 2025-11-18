import { NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest) {
  return NextResponse.json(mockCategories)
}
