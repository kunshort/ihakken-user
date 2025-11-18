"use client"

import type React from "react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Wind, Coffee } from 'lucide-react'

interface Accommodation {
  id: string
  typeName: string
  description?: string
  pricePerNight?: string
  amenities: Array<{
    id: string
    name: string
    icon?: string
  }>
  mainImage?: { id: string; url: string }[]
}

interface AccommodationGridProps {
  accommodations: Accommodation[]
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  AC: <Wind className="w-4 h-4" />,
  Breakfast: <Coffee className="w-4 h-4" />,
  Spa: <span className="text-xs">🧖</span>,
  Concierge: <span className="text-xs">🔔</span>,
}

export function AccommodationGrid({ accommodations }: AccommodationGridProps) {
  const searchParams = useSearchParams()
  const payload = searchParams.get('payload') || ''

  if (!accommodations || accommodations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No accommodations found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accommodations.map((accommodation) => {
        const imageUrl = accommodation.mainImage?.[0]?.url || '/placeholder.svg'
        const price = parseFloat(accommodation.pricePerNight || '0')
        const href = `/branch/services/lodging/${accommodation.id}${payload ? `?payload=${payload}` : ''}`

        return (
          <Link key={accommodation.id} href={href}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={accommodation.typeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.src = `/placeholder.svg?height=192&width=400&query=${accommodation.typeName}`
                  }}
                />
              </div>

              <CardContent className="p-5">
                <h3 className="font-semibold text-lg text-foreground mb-1">{accommodation.typeName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{accommodation.description || 'No description available'}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {accommodation.amenities && accommodation.amenities.length > 0 ? (
                    accommodation.amenities.slice(0, 3).map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {amenityIcons[amenity.name] || null}
                        {amenity.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No amenities listed</p>
                  )}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Per night</p>
                    <p className="text-xl font-bold text-teal-600">${price.toFixed(2)}</p>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700">View Details</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
