'use client'

import { ChevronLeft, Wifi, Wind, Coffee, Dumbbell, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

interface RoomDetails {
  id: number
  name: string
  description: string
  price: number
  amenities: string[]
  image: string
  details: {
    roomSize: string
    maxGuests: number
    bedType: string
    features: string[]
    description: string
  }
}

interface RoomDetailsClientProps {
  room: RoomDetails
  branchId: string
  selectedImageDefault: string
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
  Breakfast: <Coffee className="w-5 h-5" />,
  Spa: <Dumbbell className="w-5 h-5" />,
  Concierge: <Users className="w-5 h-5" />,
}

export default function RoomDetailsClient({
  room,
  branchId,
  selectedImageDefault,
}: RoomDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(selectedImageDefault)

  return (
    <>
      {/* Header with Background Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={selectedImage || '/placeholder.svg'}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

        {/* Back Button */}
        <Link href={`/branch/${branchId}/services/lodging`} className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl md:text-4xl font-bold text-balance">{room.name}</h1>
          <p className="text-sm md:text-base text-white/90 mt-1">{room.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Price and Booking */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Price per night</p>
            <p className="text-3xl font-bold text-teal-600">${room.price}</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
            Book Now
          </Button>
        </div>

        {/* Room Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Room Size</p>
              <p className="font-semibold text-lg">{room.details.roomSize}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Max Guests</p>
              <p className="font-semibold text-lg">{room.details.maxGuests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Bed Type</p>
              <p className="font-semibold text-lg">{room.details.bedType}</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">About This Room</h2>
          <p className="text-muted-foreground leading-relaxed">{room.details.description}</p>
        </div>

        {/* Amenities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Amenities & Services</h2>
          <div className="flex flex-wrap gap-3">
            {room.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg border border-teal-200"
              >
                {amenityIcons[amenity] || null}
                <span className="font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Room Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {room.details.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Image Gallery Thumbnails */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Gallery</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[room.image, '/luxury-deluxe-hotel-suite.jpg', '/standard-hotel-room.png'].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="relative overflow-hidden rounded-lg border-2 border-transparent hover:border-teal-600 transition-all"
              >
                <img
                  src={img || '/placeholder.svg'}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Book?</h3>
          <p className="text-muted-foreground mb-4">Secure your stay today and enjoy a wonderful experience</p>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2">
            Reserve Now
          </Button>
        </div>
      </div>
    </>
  )
}
