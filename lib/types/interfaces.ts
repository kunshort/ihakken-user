

export interface ServicesGridProps {
  services: Service[];
  branchId: string;
  hideLinks?: boolean;
}

export interface Service {
  id: string
  title: string
  description: string
  available: boolean
  icon?: string
  image?: string
  slug?: string
  type?: string
  name: string;
  service_type: string;
}

