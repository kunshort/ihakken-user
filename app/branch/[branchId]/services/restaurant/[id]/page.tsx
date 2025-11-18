"use client"

import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetMenuItemByIdQuery } from "@/lib/api/restaurant"

export default function MenuItemDetailsPage() {
  const params = useParams<{ id: string; branchId: string }>()
  const { id, branchId } = params
  const itemId = Number.parseInt(id as string)
  
  const { data: item, isLoading, error } = useGetMenuItemByIdQuery(itemId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading item details...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Link href={`/branch/${branchId}/services/restaurant`}>
            <Button variant="outline">Back to Menu</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-3 p-4">
          <Link href={`/branch/${branchId}/services/restaurant`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold flex-1">{item.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
        {/* Item Image and Info */}
        <div className="space-y-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-3xl font-bold text-teal-600 mt-2">${item.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Ingredients Section */}
        {item.ingredients && item.ingredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingredients</CardTitle>
              <CardDescription>What's in your meal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {item.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">{ingredient.emoji}</div>
                    <p className="text-sm font-medium text-foreground">{ingredient.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add-ons Section */}
        {item.addOns && item.addOns.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Add-ons</CardTitle>
                <CardDescription>Extra items customers can add</CardDescription>
              </div>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                + Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.addOns.map((addon) => (
                <div key={addon.id} className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <img
                      src={addon.image || "/placeholder.svg"}
                      alt={addon.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{addon.name}</p>
                    </div>
                  </div>
                  <p className="text-teal-600 font-semibold text-sm">+${addon.price.toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Toppings Section */}
        {item.toppings && item.toppings.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Toppings</CardTitle>
                <CardDescription>Extra ingredients added to food</CardDescription>
              </div>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                + Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.toppings.map((topping) => (
                <div key={topping.id} className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <img
                      src={topping.image || "/placeholder.svg"}
                      alt={topping.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{topping.name}</p>
                    </div>
                  </div>
                  <p className="text-teal-600 font-semibold text-sm">+${topping.price.toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Complements Section */}
        {item.complements && item.complements.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Complements</CardTitle>
                <CardDescription>Side dishes and accompaniments</CardDescription>
              </div>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                + Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.complements.map((complement) => (
                <div key={complement.id} className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <img
                      src={complement.image || "/placeholder.svg"}
                      alt={complement.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{complement.name}</p>
                    </div>
                  </div>
                  <p className="text-teal-600 font-semibold text-sm">+${complement.price.toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add to Cart Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="max-w-2xl mx-auto">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
