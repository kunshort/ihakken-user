export interface ServicesGridProps {
  services: Service[];
  branchId: string;
  hideLinks?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  available: boolean;
  icon?: string;
  image?: string;
  slug?: string;
  type?: string;
  name: string;
  service_type: string;
}
export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Accommodation {
  id: string;
  lodge: string;
  floor: string;
  type: string;
  typeName: string;
  code: string;
  description?: string;
  available: boolean;
  pricePerNight?: string;
  maxGuests?: number;
  recommendedGuests?: number;
  roomSize?: number;
  nRooms?: number;
  nBeds?: number;
  nBaths?: number;
  childrenAllowed?: boolean;
  bedConfiguration?: string;
  amenities: Amenity[];
  mainImage?: { id: string; url: string }[];
  created_at: string;
  updated_at: string;
}

export interface CustomizationItem {
  id: string;
  ingredientName?: string;
  addonName?: string;
  complementName?: string;
  toppinName?: string;
  ingredientImage?: string;
  addonImage?: string;
  complementImage?: string;
  toppinImage?: string;
  availableDays: string[];
  availability: boolean;
  extraPrice: string;
  currency: { id: number; name: string; code: string }[];
}

export interface Customization {
  id: string;
  ingredientsCustomizations: CustomizationItem[];
  addonsCustomizations: CustomizationItem[];
  complementsCustomizations: CustomizationItem[];
  toppinsCustomizations: CustomizationItem[];
  customizationPrice: string;
  availableDays: string[];
  currency: { id: number; name: string; code: string }[];
}

export interface MenuItemDetail {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  currency: { id: number; name: string; code: string }[];
  prepTime: number | null;
  priority: number;
  categories: { id: string; name: string }[];
  images: string[];
  availability: string[];
}

export interface MenuItem {
  id: string;
  branchService: string;
  branchServiceName: string;
  menuItem: MenuItemDetail;
  displayOrder: number;
  customPrice: number;
  currency: { id: number; name: string; code: string }[];
  customizations: Customization[];
  createdAt: string;
  updatedAt: string;
}