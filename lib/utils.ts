import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// utils/categoryUtils.ts
import { MenuCategory, ParentCategory } from "@/lib/types/interfaces";

export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export function buildCategoryHierarchy(categories: MenuCategory[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [{ id: "all", name: "All Items" }];

  // First pass: create all categories without children
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      children: []
    });
  });

  // Second pass: build hierarchy
  categories.forEach(cat => {
    const currentCategory = categoryMap.get(cat.id);
    
    if (!currentCategory) return;

    if (cat.parentCategories.length === 0) {
      rootCategories.push(currentCategory);
    } else {
      const parentId = cat.parentCategories[0].id;
      const parentCategory = categoryMap.get(parentId);
      
      if (parentCategory) {
        if (!parentCategory.children) {
          parentCategory.children = [];
        }
        parentCategory.children.push(currentCategory);
      } else {
        rootCategories.push(currentCategory);
      }
    }
  });

  return rootCategories;
}