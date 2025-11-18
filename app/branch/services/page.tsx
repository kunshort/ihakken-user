"use client"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react"

export default function YourComponent() {
  const searchParams = useSearchParams()
  const [branchId, setBranchId] = useState(null)
  
  useEffect(() => {
    const payload = searchParams.get('payload')
    if (payload) {
      try {
        // Decode URL-safe base64 directly
        const decoded = JSON.parse(
          Buffer.from(payload, 'base64url').toString('utf-8')
        )
        
        console.log('Successfully decoded:', decoded)
        setBranchId(decoded.branch?.id)
      } catch (error) {
        console.error("[v0] Failed to parse payload:", error)
      }
    }
  }, [searchParams])

  return (
    <div>
      {branchId ? (
        <p>Branch ID: {branchId}</p>
      ) : (
        <p>Invalid access link.</p>
      )}
    </div>
  )
}