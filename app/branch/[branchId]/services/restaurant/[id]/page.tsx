"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetMenuItemByIdQuery } from "@/lib/api/restaurant";
import Image from "next/image";

export default function MenuItemDetailsPage() {
  const params = useParams<{ id: string; branchId: string }>();
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const { id, branchId } = params;
  const itemId = id as string;

  const {
    data: menuAssignment,
    isLoading,
    error,
  } = useGetMenuItemByIdQuery(itemId);

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CHF: "CHF",
      XAF: "FCFA",
      USS: "$",
    };
    return symbols[code] || code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading item details...</p>
      </div>
    );
  }

  if (error || !menuAssignment) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Link
            href={`/branch/${branchId}/services/restaurant${
              payload ? `?payload=${payload}` : ""
            }`}
          >
            <Button variant="outline">Back to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { menuItem, customPrice, currency, customizations } = menuAssignment;
  const currencySymbol = currency?.[0]
    ? getCurrencySymbol(currency[0].code)
    : "$";
  const price = customPrice || menuItem.price;
  const mainImage = menuItem.images?.[0];
  const imageUrl = mainImage?.startsWith("http")
    ? mainImage
    : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${mainImage}`;

  // Extract customizations
  const ingredients = customizations?.[0]?.ingredientsCustomizations || [];
  const addons = customizations?.[0]?.addonsCustomizations || [];
  const toppings = customizations?.[0]?.toppinsCustomizations || [];
  const complements = customizations?.[0]?.complementsCustomizations || [];

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
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
        {/* Item Image and Info */}
        <div className="space-y-4">
          <div className="relative h-64 rounded-lg overflow-hidden">
            {mainImage ? (
              <Image
                src={imageUrl}
                alt={menuItem.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center">
                <span className="text-8xl opacity-20">🍽️</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{menuItem.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {menuItem.shortDescription}
            </p>
            {menuItem.longDescription && (
              <p className="text-sm text-foreground mb-4">
                {menuItem.longDescription}
              </p>
            )}
            <p className="text-3xl font-bold text-teal-600">
              {currencySymbol} {price.toLocaleString()}
            </p>
            {menuItem.prepTime && (
              <p className="text-sm text-muted-foreground mt-2">
                Prep time: {menuItem.prepTime} minutes
              </p>
            )}
          </div>
        </div>

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Ingredients</CardTitle>
              <CardDescription>Customize your meal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient) => {
                  const imgUrl = ingredient.ingredientImage?.startsWith("http")
                    ? ingredient.ingredientImage
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                        ingredient.ingredientImage
                      }`;

                  return (
                    <div
                      key={ingredient.id}
                      className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                    >
                      <div className="flex gap-3 flex-1 items-center">
                        {ingredient.ingredientImage && (
                          <div className="relative w-12 h-12 rounded overflow-hidden">
                            <Image
                              src={imgUrl}
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
                      {ingredient.extraPrice &&
                        parseFloat(ingredient.extraPrice) > 0 && (
                          <p className="text-teal-600 font-semibold text-sm">
                            +{currencySymbol}
                            {parseFloat(ingredient.extraPrice).toLocaleString()}
                          </p>
                        )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add-ons</CardTitle>
              <CardDescription>Extra items you can add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {addons.map((addon) => {
                const imgUrl = addon.addonImage?.startsWith("http")
                  ? addon.addonImage
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                      addon.addonImage
                    }`;

                return (
                  <div
                    key={addon.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                  >
                    <div className="flex gap-3 flex-1 items-center">
                      {addon.addonImage && (
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={imgUrl}
                            alt={addon.addonName || "Add-on"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <p className="font-medium text-sm">{addon.addonName}</p>
                    </div>
                    <p className="text-teal-600 font-semibold text-sm">
                      +{currencySymbol}
                      {parseFloat(addon.extraPrice).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Toppings Section */}
        {toppings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Toppings</CardTitle>
              <CardDescription>Extra toppings for your meal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {toppings.map((topping) => {
                const imgUrl = topping.toppinImage?.startsWith("http")
                  ? topping.toppinImage
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                      topping.toppinImage
                    }`;

                return (
                  <div
                    key={topping.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                  >
                    <div className="flex gap-3 flex-1 items-center">
                      {topping.toppinImage && (
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={imgUrl}
                            alt={topping.toppinName || "Topping"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <p className="font-medium text-sm">
                        {topping.toppinName}
                      </p>
                    </div>
                    <p className="text-teal-600 font-semibold text-sm">
                      +{currencySymbol}
                      {parseFloat(topping.extraPrice).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Complements Section */}
        {complements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complements</CardTitle>
              <CardDescription>Side dishes and accompaniments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {complements.map((complement) => {
                const imgUrl = complement.complementImage?.startsWith("http")
                  ? complement.complementImage
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${
                      complement.complementImage
                    }`;

                return (
                  <div
                    key={complement.id}
                    className="flex gap-3 p-3 bg-muted rounded-lg items-center justify-between"
                  >
                    <div className="flex gap-3 flex-1 items-center">
                      {complement.complementImage && (
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={imgUrl}
                            alt={complement.complementName || "Complement"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <p className="font-medium text-sm">
                        {complement.complementName}
                      </p>
                    </div>
                    <p className="text-teal-600 font-semibold text-sm">
                      +{currencySymbol}
                      {parseFloat(complement.extraPrice).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Add to Cart Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="max-w-2xl mx-auto">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold">
              Add to Cart - {currencySymbol} {price.toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
