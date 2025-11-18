"use client"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  useEffect(() => {
    const payload = searchParams.get('payload')
    
    if (payload) {
      // Extract the service ID from the current pathname
      // pathname will be something like "/branch/services/d8688cac-9859-4393-9d2f-7a8aad679464"
      const pathParts = pathname.split('/')
      const branchId = pathParts[pathParts.length - 1]
      
      router.push(`/branch/services/${branchId}?payload=${payload}`)
    } else {
      router.push("/branch/services")
    }
  }, [router, searchParams, pathname])
  
  return null
}