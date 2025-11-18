import { NextResponse } from "next/server"

const mockRooms = [
  {
    id: 1,
    name: "Deluxe Double Room",
    description: "Spacious room with king-size bed and city view",
    price: 250,
    image: "/modern-hotel-room.jpg",
    type: "Double",
    capacity: 2,
    bedType: "King Bed",
    amenities: [
      { id: 1, name: "WiFi", icon: "📶" },
      { id: 2, name: "Air Conditioning", icon: "❄️" },
      { id: 3, name: "Television", icon: "📺" },
    ],
    features: [
      { id: 1, name: "City View", icon: "🏙️" },
      { id: 2, name: "Balcony", icon: "🪟" },
      { id: 3, name: "Mini Bar", icon: "🥃" },
    ],
    specs: { bedrooms: 1, bathrooms: 1, area: 35 },
    imageGallery: ["/modern-hotel-room.jpg", "/luxury-hotel-lobby.jpg"],
  },
  {
    id: 2,
    name: "Standard Single Room",
    description: "Cozy room perfect for solo travelers",
    price: 150,
    image: "/modern-hotel-room.jpg",
    type: "Single",
    capacity: 1,
    bedType: "Single Bed",
    amenities: [
      { id: 1, name: "WiFi", icon: "📶" },
      { id: 2, name: "Air Conditioning", icon: "❄️" },
    ],
    features: [{ id: 1, name: "Window View", icon: "🪟" }],
    specs: { bedrooms: 1, bathrooms: 1, area: 20 },
    imageGallery: ["/modern-hotel-room.jpg"],
  },
  {
    id: 3,
    name: "Family Suite",
    description: "Large suite perfect for families with multiple rooms",
    price: 450,
    image: "/modern-hotel-room.jpg",
    type: "Suite",
    capacity: 4,
    bedType: "2 Queen Beds",
    amenities: [
      { id: 1, name: "WiFi", icon: "📶" },
      { id: 2, name: "Air Conditioning", icon: "❄️" },
      { id: 3, name: "Kitchen", icon: "🍳" },
      { id: 4, name: "Television", icon: "📺" },
    ],
    features: [
      { id: 1, name: "City View", icon: "🏙️" },
      { id: 2, name: "Balcony", icon: "🪟" },
      { id: 3, name: "Living Room", icon: "🛋️" },
    ],
    specs: { bedrooms: 2, bathrooms: 2, area: 60 },
    imageGallery: ["/modern-hotel-room.jpg", "/luxury-hotel-lobby.jpg"],
  },
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = mockRooms.find((r) => r.id === parseInt(id))

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  return NextResponse.json(room)
}
