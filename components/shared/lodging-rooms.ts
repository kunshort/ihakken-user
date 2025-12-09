import { AIChatRoomItem } from "@/components/shared/AiChatAssistant";

// This mock data is structured for the AI Chat Assistant's lodging service.
export const mockLodgingRoomsData: AIChatRoomItem[] = [
  {
    id: "room-1",
    name: "Deluxe King Room",
    shortDescription: "Spacious room with a king-sized bed and city views.",
    price: 150.0,
    currencyCode: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    amenities: ["Wi-Fi", "A/C", "TV", "Mini-bar"],
  },
  {
    id: "room-2",
    name: "Ocean View Suite",
    shortDescription:
      "Luxurious suite with a separate living area and a private balcony overlooking the ocean.",
    price: 275.0,
    currencyCode: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2142&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    amenities: ["Wi-Fi", "A/C", "Jacuzzi", "Room Service"],
  },
  {
    id: "room-3",
    name: "Standard Twin Room",
    shortDescription: "Comfortable room with two single beds, perfect for friends or family.",
    price: 120.0,
    currencyCode: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    amenities: ["Wi-Fi", "A/C", "TV"],
  },
];