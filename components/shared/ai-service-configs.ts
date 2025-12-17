import { mockMenuItemsData } from "@/components/shared/menu-items";
import { mockLodgingRoomsData } from "@/components/shared/lodging-rooms";
import { AIChatMenuItem, AIChatRoomItem } from "@/components/shared/AiChatAssistant";
// --- Restaurant Configuration ---

const mockMenuItems: AIChatMenuItem[] = mockMenuItemsData.map((item) => ({
  id: item.id,
  name: item.menuItem.name,
  shortDescription: item.menuItem.shortDescription,
  price: item.menuItem.price,
  currencyCode: item.currency?.[0]?.code || "USD",
  imageUrl: item.menuItem.images?.[0],
  prepTime: item.menuItem.prepTime,
}));

const restaurantConfig = {
  initialMessage:
    "Hello! 👋 I'm your smart menu assistant. Ask me anything about our dishes, ingredients, prices, or allergens..",
  mockReplies: [
    "Our 'Spicy Burger' is a customer favorite! It includes a special chili sauce and jalapenos.",
    "Yes, all our beef dishes are made with 100% locally sourced Angus beef.",
    "The 'Ocean's Delight' pizza contains shrimp, calamari, and mussels. It does contain shellfish allergens.",
    "A side of fries costs $3.50. You can upgrade to sweet potato fries for an extra $1.00.",
    "We do offer gluten-free bread for any of our sandwiches upon request.",
    "Our business hours are from 11:00 AM to 10:00 PM, Tuesday to Sunday.",
  ],
  specialResponse: {
    keywords: ["menu", "dishes", "items", "food"],
    responseText: "Here are some of our popular menu items:",
    data: mockMenuItems,
    cardType: "menuItem" as const,
  },
};

// --- Lodging Configuration ---

interface LodgingConfig {
  initialMessage: string;
  mockReplies: string[];
  specialResponse: {
    keywords: string[];
    responseText: string;
    data: AIChatRoomItem[];
    cardType: "room";
  };
}

const lodgingConfig: LodgingConfig = {
  initialMessage:
    "Welcome! 👋 I'm your virtual concierge. Ask me about our rooms, amenities, or booking policies.",
  mockReplies: [
    "Check-in is from 3:00 PM onwards, and check-out is by 11:00 AM.",
    "Yes, we offer complimentary high-speed Wi-Fi in all rooms and public areas.",
    "Our hotel features a swimming pool, a 24/7 gym, and an on-site spa.",
    "You can book a room directly through our website by clicking the 'Book Now' button.",
    "We have a 48-hour cancellation policy for a full refund.",
  ],
  specialResponse: {
    keywords: ["rooms", "booking", "availability", "suites", "accommodations"],
    responseText: "Here are our available room types:",
    data: mockLodgingRoomsData,
    cardType: "room" as const,
  },
};

// --- Exported Configurations ---

export const aiServiceConfigs = {
  restaurant: restaurantConfig,
  lodging: lodgingConfig,
};

export type ServiceType = keyof typeof aiServiceConfigs;