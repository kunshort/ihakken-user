"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AccommodationDetailsClient from "@/app/branch/services/[serviceId]/accommodation-details-client"

export default function ItemDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const serviceId = params.serviceId as string
  const itemId = params.itemId as string
  
  const [branchId, setBranchId] = useState<string | null>(null)

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

  if (serviceId === 'lodging') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
        <Header />
        <AccommodationDetailsClient branchId={branchId} accommodationId={itemId} />
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Service details page</p>
      </div>
      <Footer />
    </main>
  )
}
