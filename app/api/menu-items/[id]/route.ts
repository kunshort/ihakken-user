import { NextRequest, NextResponse } from "next/server"

const mockMenuItems: Record<number, any> = {
  1: {
    id: 1,
    name: "Fufu & Eru",
    description: "Delicious delicacy",
    price: 30.0,
    time: "30mins",
    image: "/fufu-and-eru-african-dish.jpg",
    category: "Main Dishes",
    ingredients: [
      { id: 1, name: "Cassava", emoji: "🥔" },
      { id: 2, name: "Plantain", emoji: "🍌" },
      { id: 3, name: "Pumpkin Leaves", emoji: "🌿" },
      { id: 4, name: "Palm Oil", emoji: "🫒" },
      { id: 5, name: "Garlic", emoji: "🧄" },
      { id: 6, name: "Onions", emoji: "🧅" },
    ],
    addOns: [
      { id: 1, name: "Extra Protein", price: 5.0, image: "/grilled-fish.jpg" },
      { id: 2, name: "Fried Egg", price: 2.0, image: "/fried-egg.jpg" },
      { id: 3, name: "Extra Sauce", price: 1.5, image: "/palm-sauce.jpg" },
    ],
    toppings: [
      { id: 1, name: "Extra Garlic", price: 0.5, image: "/bunch-of-garlic.png" },
      { id: 2, name: "Fresh Herbs", price: 1.0, image: "/fresh-herbs.jpg" },
      { id: 3, name: "Chili Flakes", price: 0.75, image: "/bowl-of-chili.png" },
    ],
    complements: [
      { id: 1, name: "Rice", price: 3.0, image: "/bowl-of-white-rice.png" },
      { id: 2, name: "Plantain Chips", price: 4.0, image: "/plantain-chips.png" },
    ],
  },
  2: {
    id: 2,
    name: "Jollof Rice",
    description: "Flavorful rice dish",
    price: 25.0,
    time: "25mins",
    image: "/vibrant-jollof-rice.png",
    category: "Main Dishes",
    ingredients: [
      { id: 1, name: "Long Grain Rice", emoji: "🍚" },
      { id: 2, name: "Tomatoes", emoji: "🍅" },
      { id: 3, name: "Peppers", emoji: "🌶️" },
      { id: 4, name: "Onions", emoji: "🧅" },
      { id: 5, name: "Carrots", emoji: "🥕" },
    ],
    addOns: [
      { id: 1, name: "Grilled Chicken", price: 8.0, image: "/grilled-chicken.png" },
      { id: 2, name: "Shrimp", price: 10.0, image: "/cooked-shrimp-platter.png" },
    ],
    toppings: [
      { id: 1, name: "Green Peas", price: 1.0, image: "/green-peas.jpg" },
      { id: 2, name: "Corn", price: 1.0, image: "/field-of-ripe-corn.png" },
    ],
    complements: [
      { id: 1, name: "Coleslaw", price: 2.5, image: "/coleslaw-salad.jpg" },
      { id: 2, name: "Fried Plantain", price: 3.5, image: "/fried-plantain.jpg" },
    ],
  },
  3: {
    id: 3,
    name: "Grilled Vegetables",
    description: "Fresh and healthy",
    price: 24.0,
    time: "25mins",
    image: "/grilled-vegetables.jpg",
    category: "Main Dishes",
    ingredients: [
      { id: 1, name: "Zucchini", emoji: "🥒" },
      { id: 2, name: "Bell Peppers", emoji: "🫑" },
      { id: 3, name: "Mushrooms", emoji: "🍄" },
      { id: 4, name: "Broccoli", emoji: "🥦" },
      { id: 5, name: "Olive Oil", emoji: "🫒" },
    ],
    addOns: [
      { id: 1, name: "Grilled Cheese", price: 3.5, image: "/grilled-cheese.jpg" },
      { id: 2, name: "Tofu", price: 4.0, image: "/tofu-block.jpg" },
    ],
    toppings: [
      { id: 1, name: "Garlic Seasoning", price: 0.5, image: "/garlic-powder.png" },
      { id: 2, name: "Herbs", price: 1.0, image: "/fresh-herbs.jpg" },
    ],
    complements: [
      { id: 1, name: "Brown Rice", price: 3.0, image: "/brown-rice.jpg" },
      { id: 2, name: "Quinoa", price: 4.5, image: "/quinoa-bowl.jpg" },
    ],
  },
  4: {
    id: 4,
    name: "Fried Rice",
    description: "Savory combination",
    price: 22.0,
    time: "20mins",
    image: "/fried-rice-asian.jpg",
    category: "Main Dishes",
    ingredients: [
      { id: 1, name: "Rice", emoji: "🍚" },
      { id: 2, name: "Eggs", emoji: "🥚" },
      { id: 3, name: "Carrots", emoji: "🥕" },
      { id: 4, name: "Peas", emoji: "🫛" },
      { id: 5, name: "Soy Sauce", emoji: "🫘" },
    ],
    addOns: [
      { id: 1, name: "Chicken", price: 6.0, image: "/grilled-chicken.png" },
      { id: 2, name: "Beef", price: 7.0, image: "/beef-steak.jpg" },
      { id: 3, name: "Shrimp", price: 8.0, image: "/cooked-shrimp-platter.png" },
    ],
    toppings: [
      { id: 1, name: "Spring Onions", price: 0.75, image: "/spring-onions.jpg" },
      { id: 2, name: "Sesame Seeds", price: 1.0, image: "/sesame-seeds.png" },
    ],
    complements: [
      { id: 1, name: "Soup", price: 3.0, image: "/soup-bowl.jpg" },
    ],
  },
  5: {
    id: 5,
    name: "Spring Rolls",
    description: "Crispy appetizer",
    price: 15.0,
    time: "15mins",
    image: "/fresh-spring-rolls.png",
    category: "Starters",
    ingredients: [
      { id: 1, name: "Rice Paper", emoji: "📄" },
      { id: 2, name: "Vegetables", emoji: "🥬" },
      { id: 3, name: "Mint", emoji: "🌿" },
      { id: 4, name: "Peanuts", emoji: "🥜" },
    ],
    addOns: [
      { id: 1, name: "Extra Sauce", price: 1.5, image: "/peanut-sauce.jpg" },
    ],
    toppings: [
      { id: 1, name: "Sesame Seeds", price: 1.0, image: "/sesame-seeds.png" },
    ],
    complements: [],
  },
  6: {
    id: 6,
    name: "Garlic Bread",
    description: "Warm and buttery",
    price: 12.0,
    time: "10mins",
    image: "/garlic-bread.png",
    category: "Starters",
    ingredients: [
      { id: 1, name: "Bread", emoji: "🍞" },
      { id: 2, name: "Garlic", emoji: "🧄" },
      { id: 3, name: "Butter", emoji: "🧈" },
      { id: 4, name: "Parsley", emoji: "🌿" },
    ],
    addOns: [
      { id: 1, name: "Extra Cheese", price: 2.0, image: "/melted-cheese.jpg" },
    ],
    toppings: [
      { id: 1, name: "Chili Flakes", price: 0.75, image: "/bowl-of-chili.png" },
    ],
    complements: [],
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const itemId = Number.parseInt(params.id)
  const item = mockMenuItems[itemId]

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  return NextResponse.json(item)
}
