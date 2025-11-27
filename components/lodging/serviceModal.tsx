"use client"

import { useState } from "react"
import { Phone, Users, Utensils, ShoppingCart, Wrench } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CallServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const services = [
  {
    id: "reception",
    name: "Reception",
    description: "Contact the front desk",
    icon: Users,
  },
  {
    id: "room-service",
    name: "Room Service",
    description: "Order food and beverages",
    icon: Utensils,
  },
  {
    id: "housekeeping",
    name: "Housekeeping",
    description: "Request cleaning or towels",
    icon: ShoppingCart,
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Report maintenance issues",
    icon: Wrench,
  },
  {
    id: "security",
    name: "Security",
    description: "Report security concerns",
    icon: Users,
  },
  {
    id: "janitorial",
    name: "Janitorial",
    description: "Request janitorial services",
    icon: ShoppingCart,
  },
]

export function CallServiceModal({ open, onOpenChange }: CallServiceModalProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const handleCall = (serviceId: string) => {
    setSelectedService(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      // Simulate calling the service
      alert(`Calling ${service.name}...`)
      onOpenChange(false)
      setSelectedService(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" />
            Call a Service
          </DialogTitle>
          <DialogDescription>Choose the service you want to contact</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <button
                key={service.id}
                onClick={() => handleCall(service.id)}
                disabled={selectedService !== null}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border hover:border-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="w-6 h-6 text-teal-600" />
                <span className="text-sm font-medium text-center">{service.name}</span>
                <span className="text-xs text-muted-foreground text-center">{service.description}</span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
