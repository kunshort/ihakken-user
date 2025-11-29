import { MenuItemDetail } from "@/lib/types/interfaces";

// This mock data is structured to match the `MenuItem` interface,
// which is what the item detail page expects.
export const mockMenuItemsData: MenuItemDetail[] = [
  {
    id: "mock-item-1",
    menuItem: {
      id: "mi-1",
      name: "Classic Cheeseburger",
      shortDescription: "Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce.",
      price: 12.99,
      images: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
      prepTime: 15,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
  {
    id: "mock-item-2",
    menuItem: {
      id: "mi-2",
      name: "Spicy Chicken Sandwich",
      shortDescription: "Crispy fried chicken breast with spicy mayo, pickles, and coleslaw on a brioche bun.",
      price: 11.50,
      images: ["https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
      prepTime: 18,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
  {
    id: "mock-item-3",
    menuItem: {
      id: "mi-3",
      name: "Vegan Buddha Bowl",
      shortDescription: "Quinoa, roasted sweet potatoes, avocado, chickpeas, and mixed greens with a tahini dressing.",
      price: 14.00,
      images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
      prepTime: 20,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
  {
    id: "mock-item-4",
    menuItem: {
      id: "mi-4",
      name: "Truffle Fries",
      shortDescription: "Crispy golden fries tossed with truffle oil and parmesan cheese.",
      price: 6.00,
      images: ["https://images.unsplash.com/photo-1598679253351-d3a982d3a3a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
      prepTime: 10,
    },
    currency: [{ code: "USD", name: "US Dollar" }],
  },
];