'use client'

import { useGetAccommodationByIdQuery } from '@/lib/api/lodging'
import AccommodationDetailsClient from './accommodation-details-client'
import { useParams } from 'next/navigation'

export default function AccommodationDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const branchId = params.branchId as string

  const { data: accommodation, isLoading, error } = useGetAccommodationByIdQuery({
    branchId,
    accommodationId: id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading accommodation...</p>
      </div>
    )
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Accommodation not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetailsClient
        accommodation={accommodation}
        branchId={branchId}
        selectedImageDefault={accommodation.mainImage?.[0]?.url || '/placeholder.svg'}
      />
    </div>
  )
}
