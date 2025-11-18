"use client"

import type React from "react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Wind, Coffee } from 'lucide-react'

interface Room {
  id: number | string
  name: string
  description: string
  price: number
  amenities: string[]
  image?: string
}

interface RoomGridProps {
  rooms: Room[]
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  AC: <Wind className="w-4 h-4" />,
  Breakfast: <Coffee className="w-4 h-4" />,
  Spa: <span className="text-xs">🧖</span>,
  Concierge: <span className="text-xs">🔔</span>,
}

export function RoomGrid({ rooms }: RoomGridProps) {
  const params = useParams()
  const branchId = params.branchId as string

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No rooms found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Link key={room.id} href={`/branch/${branchId}/services/lodging/${room.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
            <div className="relative h-48 overflow-hidden bg-muted">
              {room.image ? (
                <img
                  src={room.image || "/placeholder.svg"}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.src = `/placeholder.svg?height=192&width=400&query=${room.name}`
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>

            <CardContent className="p-5">
              <h3 className="font-semibold text-lg text-foreground mb-1">{room.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{room.description}</p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities && room.amenities.length > 0 ? (
                  room.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {amenityIcons[amenity] || null}
                      {amenity}
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
                  <p className="text-xl font-bold text-teal-600">${typeof room.price === 'number' ? room.price.toFixed(2) : room.price}</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">View Details</Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
