"use client";

import { ArrowLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetMenuItemsQuery } from "@/lib/api/restaurant";
import { useDecodePayloadQuery } from "@/lib/api/lodging";
import { skipToken } from "@reduxjs/toolkit/query/react";
import Image from "next/image";
import { MenuItem } from "@/lib/types/interfaces";
import { CustomizationItem } from "@/lib/types/interfaces";
import { BASE_API_URL } from "@/lib/api/base";
import EmptyContent from "@/components/shared/noContent";
import ErrorComponent from "@/components/shared/errorComponent";

export default function MenuItemDetailsPage() {
  const params = useParams<{ id: string; branchId: string }>();
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const { id, branchId } = params;
  const itemId = id as string;

  // State for quantities
  const [mainQuantity, setMainQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>(
    {}
  );
  const [selectedToppings, setSelectedToppings] = useState<
    Record<string, number>
  >({});
  const [selectedComplements, setSelectedComplements] = useState<
    Record<string, number>
  >({});

  const { data: decoded, isLoading: payloadLoading } =
    useDecodePayloadQuery(payload);

  const serviceId = decoded?.services.find(
    (s: any) => s.serviceType?.toLowerCase() === "restaurant"
  )?.id;
  
  const stableMenuQueryArg = useMemo(
    () => (serviceId ? { serviceId } : skipToken),
    [serviceId]
  );

  const { 
    data: menuData, 
    isLoading: isLoadingMenu,
    error: menuError,
    refetch: refetchMenu
  } = useGetMenuItemsQuery(stableMenuQueryArg);

  // Extract menu items from the response (handle the nested data structure)
  const menuItems: MenuItem[] = menuData?.data || [];

  const menuAssignment = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return null;
    return menuItems.find((item: MenuItem) => item.id === itemId);
  }, [menuItems, itemId]);

  const updateQuantity = (
    type: "addOns" | "toppings" | "complements",
    id: string,
    newQty: number
  ) => {
    if (type === "addOns") {
      setSelectedAddOns((prev) =>
        newQty <= 0 ? { ...prev, [id]: 0 } : { ...prev, [id]: newQty }
      );
    } else if (type === "toppings") {
      setSelectedToppings((prev) =>
        newQty <= 0 ? { ...prev, [id]: 0 } : { ...prev, [id]: newQty }
      );
    } else {
      setSelectedComplements((prev) =>
        newQty <= 0 ? { ...prev, [id]: 0 } : { ...prev, [id]: newQty }
      );
    }
  };

  const handleRetry = () => {
    refetchMenu();
  };

  // Loading state
  if (payloadLoading || isLoadingMenu) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading item details...</p>
      </div>
    );
  }

  // Error state
  if (menuError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-2xl mx-auto flex items-center gap-3 p-4">
            <Link
              href={`/branch/${branchId}/services/restaurant${
                payload ? `?payload=${payload}` : ""
              }`}
            >
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold flex-1">Menu Item</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <ErrorComponent
            errorMessage="Failed to load menu item details. Please try again."
            handleRetry={handleRetry}
            isRetrying={isLoadingMenu}
          />
        </div>
      </div>
    );
  }

  // Item not found state
  if (!menuAssignment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-2xl mx-auto flex items-center gap-3 p-4">
            <Link
              href={`/branch/${branchId}/services/restaurant${
                payload ? `?payload=${payload}` : ""
              }`}
            >
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold flex-1">Menu Item</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="min-h-[60vh] flex items-center justify-center">
            <EmptyContent
              message="Item Not Found"
              description="The menu item you're looking for doesn't exist or has been removed."
              actionLabel="Back to Menu"
              actionHref={`/branch/${branchId}/services/restaurant${
                payload ? `?payload=${payload}` : ""
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  const { menuItem, customPrice, currency, customizations } = menuAssignment;
  const currencySymbol = currency?.[0]?.code ;
  const price = customPrice || menuItem.price;
  const mainImage = menuItem.images?.[0];
  const imageUrl = mainImage?.startsWith("http")
    ? mainImage
    : `${BASE_API_URL}${mainImage}`;

  // Extract customizations
  const ingredients = customizations?.[0]?.ingredientsCustomizations || [];
  const addons = customizations?.[0]?.addonsCustomizations || [];
  const toppings = customizations?.[0]?.toppinsCustomizations || [];
  const complements = customizations?.[0]?.complementsCustomizations || [];

  // Calculate quantities and totals
  const totalAddOns = Object.values(selectedAddOns).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const totalToppings = Object.values(selectedToppings).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const totalComplements = Object.values(selectedComplements).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const totalItems =
    mainQuantity + totalAddOns + totalToppings + totalComplements;

  // Calculate total price
  const mainPrice = price * mainQuantity;
  const addOnsPrice = addons.reduce(
    (sum: number, addon: CustomizationItem) =>
      sum + parseFloat(addon.extraPrice) * (selectedAddOns[addon.id] || 0),
    0
  );
  const toppingsPrice = toppings.reduce(
    (sum: number, topping: CustomizationItem) =>
      sum +
      parseFloat(topping.extraPrice) * (selectedToppings[topping.id] || 0),
    0
  );
  const complementsPrice = complements.reduce(
    (sum: number, complement: CustomizationItem) =>
      sum +
      parseFloat(complement.extraPrice) *
        (selectedComplements[complement.id] || 0),
    0
  );
  const totalPrice = mainPrice + addOnsPrice + toppingsPrice + complementsPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-3 p-4">
          <Link
            href={`/branch/${branchId}/services/restaurant${
              payload ? `?payload=${payload}` : ""
            }`}
          >
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold flex-1">{menuItem.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
        {/* Item Image and Info */}
        <div className="space-y-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            {mainImage ? (
              <Image
                src={imageUrl}
                alt={menuItem.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-teal-100 to-teal-50 flex items-center justify-center">
                <span className="text-8xl opacity-20">🍽️</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {menuItem.shortDescription}
            </p>
            
             <div className="flex gap-4 justify-between  text-3xl font-bold text-[#004248] mt-2">
               {currencySymbol}  
              {price}
             </div>
            
          </div>

          {/* Main Item Quantity Selector */}
          <Card className="bg-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-3 bg-white border rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      setMainQuantity(Math.max(1, mainQuantity - 1))
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">
                    {mainQuantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setMainQuantity(mainQuantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingredients</CardTitle>
              <CardDescription>What's in your meal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient: CustomizationItem) => (
                  <div
                    key={ingredient.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                  >
                    <div className="flex gap-3 flex-1 items-center">
                      {ingredient.ingredientImage && (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={
                              ingredient.ingredientImage?.startsWith("http")
                                ? ingredient.ingredientImage
                                : `${BASE_API_URL}${ingredient.ingredientImage}`
                            }
                            alt={ingredient.ingredientName || "Ingredient"}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <p className="font-medium text-sm">
                        {ingredient.ingredientName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Add-ons</CardTitle>
                <CardDescription>
                  {totalAddOns > 0
                    ? `${totalAddOns} selected`
                    : "Extra items you can add"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {addons.map((addon: CustomizationItem) => (
                <div
                  key={addon.id}
                  className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                >
                  <div className="flex gap-3 flex-1">
                    {addon.addonImage && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={
                            addon.addonImage?.startsWith("http")
                              ? addon.addonImage
                              : `${BASE_API_URL}${addon.addonImage}`
                          }
                          alt={addon.addonName || "Add-on"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{addon.addonName}</p>
                      <p className="text-[#004248] font-semibold text-sm">
                        {currencySymbol}
                        {parseFloat(addon.extraPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "addOns",
                          addon.id,
                          (selectedAddOns[addon.id] || 0) - 1
                        )
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {selectedAddOns[addon.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "addOns",
                          addon.id,
                          (selectedAddOns[addon.id] || 0) + 1
                        )
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Toppings Section */}
        {toppings.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Toppings</CardTitle>
                <CardDescription>
                  {totalToppings > 0
                    ? `${totalToppings} selected`
                    : "Extra toppings for your meal"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {toppings.map((topping: CustomizationItem) => (
                <div
                  key={topping.id}
                  className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                >
                  <div className="flex gap-3 flex-1">
                    {topping.toppinImage && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={
                            topping.toppinImage?.startsWith("http")
                              ? topping.toppinImage
                              : `${BASE_API_URL}${topping.toppinImage}`
                          }
                          alt={topping.toppinName || "Topping"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {topping.toppinName}
                      </p>
                      <p className="text-[#004248] font-semibold text-sm">
                        {currencySymbol}
                        {parseFloat(topping.extraPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "toppings",
                          topping.id,
                          (selectedToppings[topping.id] || 0) - 1
                        )
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {selectedToppings[topping.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "toppings",
                          topping.id,
                          (selectedToppings[topping.id] || 0) + 1
                        )
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Complements Section */}
        {complements.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Complements</CardTitle>
                <CardDescription>
                  {totalComplements > 0
                    ? `${totalComplements} selected`
                    : "Side dishes and accompaniments"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {complements.map((complement: CustomizationItem) => (
                <div
                  key={complement.id}
                  className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                >
                  <div className="flex gap-3 flex-1">
                    {complement.complementImage && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={
                            complement.complementImage?.startsWith("http")
                              ? complement.complementImage
                              : `${BASE_API_URL}${complement.complementImage}`
                          }
                          alt={complement.complementName || "Complement"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {complement.complementName}
                      </p>
                      <p className="text-[#004248] font-semibold text-sm">
                        {currencySymbol}
                        {parseFloat(complement.extraPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "complements",
                          complement.id,
                          (selectedComplements[complement.id] || 0) - 1
                        )
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {selectedComplements[complement.id] || 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() =>
                        updateQuantity(
                          "complements",
                          complement.id,
                          (selectedComplements[complement.id] || 0) + 1
                        )
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Main Item:</span>
                <span className="font-medium">{mainQuantity}</span>
              </div>
              {totalAddOns > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons:</span>
                  <span className="font-medium">{totalAddOns}</span>
                </div>
              )}
              {totalToppings > 0 && (
                <div className="flex justify-between ">
                  <span className="text-muted-foreground">Toppings:</span>
                  <span className="font-medium">{totalToppings}</span>
                </div>
              )}
              {totalComplements > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complements:</span>
                  <span className="font-medium">{totalComplements}</span>
                </div>
              )}
              <div className="border-t border-teal-200 pt-2 flex justify-between font-bold">
                <span>Total Items:</span>
                <span className="text-[#004248]">{totalItems}</span>
              </div>
            </div>
            <div className="border-t border-teal-200 pt-3 flex justify-between items-center">
              <span className="font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-[#004248] flex justify-between">
                {currencySymbol}
                {totalPrice.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}