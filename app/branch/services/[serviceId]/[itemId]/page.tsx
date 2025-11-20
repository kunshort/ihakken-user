"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import AccommodationDetailsClient from "@/app/branch/services/[serviceId]/accommodation-details-client"

// ------------------------------------------------------
// FIXED: Base64URL → Base64 decoder for JWT payload
// ------------------------------------------------------
function decodePayload(payload: string) {
  try {
    const base64Url = payload.split(".")[1]
    if (!base64Url) return null

    // Convert Base64URL → Base64
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        base64Url.length + ((4 - (base64Url.length % 4)) % 4),
        "="
      )

    return JSON.parse(atob(base64))
  } catch (err) {
    console.error("[v0] Failed to decode payload:", err)
    return null
  }
}

export default function ItemDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const serviceId = params.serviceId as string
  const itemId = params.itemId as string

  const [branchId, setBranchId] = useState<string | null>(null)

  useEffect(() => {
    const payload = searchParams.get("payload")

    if (payload) {
      const decoded = decodePayload(payload)
      if (decoded?.branchId) {
        setBranchId(decoded.branchId)
      }
    }
  }, [searchParams])

  // ------------------------------------------------------
  // If branchId invalid → show error page
  // ------------------------------------------------------
  if (!branchId) {
    return (
      <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-destructive">Invalid access link.</p>
        </div>
        <Footer />
      </main>
    )
  }

  // ------------------------------------------------------
  // Lodging page
  // ------------------------------------------------------
  if (serviceId === "lodging") {
    return (
      <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
        <Header />
        <AccommodationDetailsClient
          branchId={branchId}
          accommodationId={itemId}
        />
        <Footer />
      </main>
    )
  }

  // ------------------------------------------------------
  // Default service page
  // ------------------------------------------------------
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
