import { MenuItem } from "@/lib/types/interfaces";

// This mock data is structured to match the `MenuItem` interface,
// which is what the item detail page expects.
export const mockMenuItemsData: MenuItem[] = [
  {
    id: "mock-item-1",
    branchService: "mock-branch-service",
    branchServiceName: "Mock Restaurant",
    menuItem: {
      id: "mi-1",
      name: "Classic Cheeseburger",
      shortDescription:
        "Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce.",
      longDescription: "A delicious classic cheeseburger.",
      price: 12.99,
      currency: [{ id: 1, name: "US Dollar", code: "USD" }],
      prepTime: 15,
      priority: 1,
      categories: [{ id: "cat1", name: "Burgers" }],
      images: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      availability: ["all"],
    },
    displayOrder: 1,
    customPrice: 12.99,
    currency: [{ id: 1, name: "US Dollar", code: "USD" }],
    customizations: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    data: null,
  },
  {
    id: "mock-item-2",
    menuItem: {
      id: "mi-2",
      name: "Spicy Chicken Sandwich",
      shortDescription:
        "Crispy fried chicken breast with spicy mayo, pickles, and coleslaw on a brioche bun.",
      price: 11.5,
      images: [
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      prepTime: 18,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
  {
    id: "mock-item-3",
    menuItem: {
      id: "mi-3",
      name: "Vegan Buddha Bowl",
      shortDescription:
        "Quinoa, roasted sweet potatoes, avocado, chickpeas, and mixed greens with a tahini dressing.",
      price: 14.0,
      images: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      prepTime: 20,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
  {
    id: "mock-item-4",
    menuItem: {
      id: "mi-4",
      name: "Truffle Fries",
      shortDescription:
        "Crispy golden fries tossed with truffle oil and parmesan cheese.",
      price: 6.0,
      images: [
        "https://images.unsplash.com/photo-1598679253351-d3a982d3a3a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      prepTime: 10,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
];
