export interface Service {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  type: "restaurant" | "lodging" | "gym" | "pool"
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com"

// Fetch all services for a branch
export async function fetchBranchServices(
  branchId: string
): Promise<Service[]> {
  try {
    const url = `${API_BASE_URL}/api/v1/core/branches/${branchId}/services/?services=serviceslug`
    console.log("[v0] Fetching services from:", url)
    console.log("[v0] API_BASE_URL:", API_BASE_URL)
    
    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      }
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    })

    if (!response.ok) {
      console.error(`[v0] Failed to fetch services: ${response.status} ${response.statusText}`)
      return []
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      console.error(`[v0] Invalid content type: ${contentType}`)
      // Try to read response body for debugging
      const text = await response.text()
      console.error("[v0] Response body:", text.substring(0, 200))
      return []
    }

    const data = await response.json()
    console.log("[v0] API Response data:", data)

    let services = Array.isArray(data) ? data : (data?.data || data?.services || [])
    
    if (!Array.isArray(services)) {
      console.error("[v0] Response is not an array:", typeof services)
      return []
    }

    return services.map((service: any) => ({
      id: service.id || service.slug,
      name: service.name,
      slug: service.slug,
      description: service.description,
      image: service.image,
      type: service.type || service.slug,
    }))
  } catch (error) {
    console.error("[v0] Error fetching services:", error)
    return []
  }
}

// Fetch service details by slug
export async function fetchServiceBySlug(
  branchId: string,
  serviceSlug: string
) {
  try {
    const url = `${API_BASE_URL}/api/v1/core/branches/${branchId}/services/${serviceSlug}`
    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      }
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching service:", error)
    return null
  }
}
