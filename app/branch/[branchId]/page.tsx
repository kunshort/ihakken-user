"use client"

import { Header } from "@/components/header"
import { ServicesGrid } from "@/components/services-grid"
import { Footer } from "@/components/footer"
import { useGetServicesByBranchQuery } from "@/lib/api/services-api"
import { useParams } from 'next/navigation'

export default function BranchPage() {
  const params = useParams()
  const branchId = params.branchId as string

  const { data: services = [], isLoading, error } = useGetServicesByBranchQuery({
    branchId,
  })

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Your Premier Destination</h1>
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

        {!isLoading && !error && <ServicesGrid services={services} branchId={branchId} />}
      </div>

      <Footer />
    </main>
  )
}
