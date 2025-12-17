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
export interface FloorData {
  floor: string;
  floorName: string;
  accommodations: Accommodation[];
}

export interface Accommodation {
  id: string;
  lodge: string;
  floor: string;
  code: string;
  type: string;
  typeName: string;
  category: string; 
  description?: string;
  available: boolean;
  currency: { id: number; name: string; code: string };
  pricePerNight: string;
  amenities: Amenity[];
  maxGuests: number;
  recommendedGuests: number;
  roomSize: number;
  nRooms: number;
  nBeds: number;
  nBaths: number;
  childrenAllowed: boolean;
  bedConfiguration: string;
  mainImage?: { id: string; url: string }[];
  created_at: string;
  updated_at: string;
}


export interface LodgingApiResponse {
  erc: number;
  msg: string;
  total: number;
  next: null;
  data: {
    erc: number;
    msg: string;
    total: number;
    next: null;
    data: FloorData[];
  };
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
  data: any;
}


export interface ParentCategory {
  id: string;
  name: string;
}

export interface MenuCategory {
  id: string;
  parentCategories: ParentCategory[];
  name: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  priority: number;
  categoryClass: string;
  user: string;
}

export interface MenuCategoryResponse {
  erc: number;
  msg: string;
  total: number;
  next: string | null;
  data: MenuCategory[];
}

export interface LodgingCategory {
  id: string;
  name: string;
  children?: LodgingCategory[];
}


export interface NestedApiResponse {
  erc: number;
  msg: string;
  total: number;
  next: string | null;
  data: {
    erc: number;
    msg: string;
    total: number;
    next: string | null;
    data: FloorData[];
  };
}


export type ImageValue = File | { id?: number | string; image: string; url?: string };
