import Link from "next/link"
import { Building2, UtensilsCrossed, Dumbbell, Waves } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Service } from "@/lib/api/services-api"
import { useSearchParams } from 'next/navigation'

interface ServicesGridProps {
  services: Service[]
  branchId: string
  hideLinks?: boolean
}

const serviceIcons: Record<string, React.ReactNode> = {
  restaurant: <UtensilsCrossed className="w-6 h-6" />,
  lodging: <Building2 className="w-6 h-6" />,
  gym: <Dumbbell className="w-6 h-6" />,
  pool: <Waves className="w-6 h-6" />,
}

const serviceColors: Record<string, string> = {
  restaurant: "from-orange-400 to-orange-600",
  lodging: "from-blue-400 to-blue-600",
  gym: "from-red-400 to-red-600",
  pool: "from-cyan-400 to-cyan-600",
}

export function ServicesGrid({ services, branchId, hideLinks = false }: ServicesGridProps) {
  const searchParams = useSearchParams()
  const payload = searchParams.get('payload') || ''

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No services available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((service) => {
        const slug = service.slug || service.id.toLowerCase()
        const type = service.type || service.id.toLowerCase()
        const Icon = serviceIcons[type] || Building2
        const color = serviceColors[type] || "from-blue-400 to-blue-600"
        const href = `/branch/services/${slug}${payload ? `?payload=${payload}` : ''}`

        return (
          <Link key={service.id} href={href}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="relative h-48 overflow-hidden bg-muted">
                {service.image ? (
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = `/placeholder.svg?height=192&width=400&query=${service.title}`
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
              </div>

              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                    <div className="text-white">{Icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
