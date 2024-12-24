import { unitOptions } from "./utils";

export type Ingredient = {
  name: string;
  amount: number;
  unit: keyof typeof unitOptions;
};

export type RecipeStep = {
  description: string;
};

export type Recipe = {
  id: string;
  name: string;
  tags: string[];
  pictureUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
};
