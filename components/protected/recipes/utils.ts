// Normalization works for tasks that are already sorted by sortOrder

import { RecipeModel } from "./recipe-model";
import { IngredientModel } from "./sections/ingredient/ingredient-model";
import { RecipeSectionModel } from "./sections/recipe-section-schema";

// If not then wrong indices will be asigned to sort order
export const normalizeRecipeSortOrder = (recipes: RecipeModel[]): RecipeModel[] => {
  return recipes.map((recipe, index) => ({
    ...recipe,
    sortOrder: index + 1,
    sections: normalizeRecipeSectionsSortOrder(recipe.sections)
  }));
};
// Normalization works for task items that are already sorted by sortOrder
// If not then wrong indices will be asigned to sort order
export const normalizeRecipeSectionsSortOrder = (sections: RecipeSectionModel[]): RecipeSectionModel[] => {
    return sections.map((section, index) => ({
        ...section,
        sortOrder: index + 1,
        ...(section.type === 'INGREDIENTS' && { ingredients: normalizeIngredientsSortOrder(section.ingredients)})
    }))
} 
// Ingredients normalization
export const normalizeIngredientsSortOrder = (ingredients: IngredientModel[]): IngredientModel[] => {
    return ingredients.map((ingredient, index) => ({
        ...ingredient,
        sortOrder: index + 1,
    }))
} 
