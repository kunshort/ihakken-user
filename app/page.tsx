"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const payload = searchParams.get('payload')
    if (payload) {
      router.push(`/branch/services?payload=${payload}`)
    } else {
      router.push("/branch/services")
    }
  }, [router, searchParams])

  return null
}
