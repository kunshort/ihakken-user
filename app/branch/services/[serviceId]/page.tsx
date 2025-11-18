"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AccommodationGrid } from "@/components/lodging/accommodation-grid"
import RestaurantLayout from "@/components/restaurant/layout"
import { useGetAccommodationsQuery } from "@/lib/api/lodging"

interface PayloadData {
  branchId: string
  [key: string]: any
}

export default function ServiceDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const serviceId = params.serviceId as string
  
  const [branchId, setBranchId] = useState<string | null>(null)
  const [serviceType, setServiceType] = useState<string | null>(null)

  useEffect(() => {
    const payload = searchParams.get('payload')
    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload.split('.')[1]))
        setBranchId(decoded.branchId)
      } catch (error) {
        console.error("[v0] Failed to parse payload:", error)
      }
    }
  }, [searchParams])

  useEffect(() => {
    const slugMap: Record<string, string> = {
      'lodging': 'lodging',
      'restaurant': 'restaurant',
      'gym': 'gym',
      'pool': 'pool',
    }
    
    const type = slugMap[serviceId] || serviceId
    setServiceType(type)
  }, [serviceId])

  if (!branchId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-destructive">Invalid access link.</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link 
          href={`/branch/services?payload=${searchParams.get('payload')}`}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Services
        </Link>

        {serviceType === 'lodging' && <AccommodationGrid branchId={branchId} />}
        {serviceType === 'restaurant' && <RestaurantLayout branchId={branchId} />}
      </div>

      <Footer />
    </main>
  )
}
