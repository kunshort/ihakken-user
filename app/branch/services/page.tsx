"use client"

import { Header } from "@/components/header"
import { ServicesGrid } from "@/components/services-grid"
import { Footer } from "@/components/footer"
import { useGetServicesByBranchQuery } from "@/lib/api/services-api"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PayloadData {
  branchId: string
  [key: string]: any
}

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const [branchId, setBranchId] = useState<string | null>(null)

  useEffect(() => {
    const payload = searchParams.get('payload')
    if (payload) {
      try {
        // Decode JWT or parse payload to get branchId
        const decoded = JSON.parse(atob(payload.split('.')[1]))
        setBranchId(decoded.branchId)
      } catch (error) {
        console.error("[v0] Failed to parse payload:", error)
      }
    }
  }, [searchParams])

  const { data: services = [], isLoading, error } = useGetServicesByBranchQuery(
    { branchId: branchId || "" },
    { skip: !branchId }
  )

  if (!branchId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-destructive">Invalid access link. Please use a valid QR code.</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Our Services</h1>
          <p className="text-muted-foreground">Explore our curated services</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load services. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && <ServicesGrid services={services} branchId={branchId} hideLinks={false} />}
      </div>

      <Footer />
    </main>
  )
}
