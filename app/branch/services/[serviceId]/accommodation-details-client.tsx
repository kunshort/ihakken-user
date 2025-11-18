"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Wifi, AirVent, TrendingUp } from 'lucide-react'
import { useGetAccommodationByIdQuery } from '@/lib/api/lodging'

interface AccommodationDetailsClientProps {
  branchId: string
  accommodationId: string
}

export default function AccommodationDetailsClient({
  branchId,
  accommodationId,
}: AccommodationDetailsClientProps) {
  const searchParams = useSearchParams()
  const payload = searchParams.get('payload') || ''

  const { data: accommodation, isLoading, error } = useGetAccommodationByIdQuery({
    branchId,
    accommodationId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading accommodation details...</p>
      </div>
    )
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load accommodation details.</p>
      </div>
    )
  }

  const getImageUrl = (url: string): string => {
    if (!url) return `/placeholder.svg?height=400&width=800&query=accommodation`
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/branch/services/lodging?payload=${payload}`}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Accommodations
        </Link>

        {/* Image Gallery */}
        {accommodation.mainImage && accommodation.mainImage.length > 0 && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden bg-muted">
            <img
              src={getImageUrl(accommodation.mainImage[0].url) || "/placeholder.svg"}
              alt={accommodation.typeName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-foreground mb-2">{accommodation.typeName}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{accommodation.location || 'Location not specified'}</span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed">
                {accommodation.description || 'No description available'}
              </p>
            </div>

            {accommodation.amenities && accommodation.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {accommodation.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Wifi className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-3xl font-bold text-foreground mb-4">
                ${accommodation.pricePerNight}
                <span className="text-sm text-muted-foreground">/night</span>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3">
                Book Now
              </button>

              <button className="w-full border border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
