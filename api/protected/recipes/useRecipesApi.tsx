import { api } from '@/api/api';
import { queryClient } from '@/components/common/queryClient/queryClient';
import { mainIdOrNullIfNew, nullIfTrackingIdElseKeep, idOrNullIfNew } from '@/components/common/utils';
import { RecipeModel, RecipeSchema } from '@/components/protected/recipes/recipe-model';
import { IngredientModelSchema } from '@/components/protected/recipes/sections/ingredient/ingredient-model';
import { RecipeSectionModel } from '@/components/protected/recipes/sections/recipe-section-schema';
import { normalizeRecipeSectionsSortOrder } from '@/components/protected/recipes/utils';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';


export const useRecipesApi = (ownerId: string) => {

  // Fetches list of recipes but ignores items that that do not pass validation
  const get = (ownerId: string, onSuccess: (data: RecipeModel[]) => void) =>
    useQuery<RecipeModel[], Error>({
      queryKey: ['recipes', ownerId],
      queryFn: async () => {
        const res = await api.get(`/recipes?ownerId=${ownerId}`, {
          headers: { 'Content-Type': 'application/json' }
        })
        const json = res.data;
        if (!Array.isArray(json)) throw new Error('Response is not array')
          // this eliminated invalid recipes, but should eliminate only items that are not valid
        const result = json
          .map(recipe => RecipeSchema.safeParse(recipe).data)
          .filter((r): r is RecipeModel => r != undefined)
        onSuccess(result)
        return result
      },
  })

  const createRecipeMutation = useMutation({
    mutationFn: async (body: RecipeModel) => {
      // Strips fake [NEW] ids
      // TODO move this to sanitization mapper
      const sanitizedBody = { 
        ...body,
        id: mainIdOrNullIfNew(body),
        sections: body.sections.map(section => ({
          ...section, 
          id: mainIdOrNullIfNew(section),
          ingredients: 
            section.type == 'INGREDIENTS' ? 
            section.ingredients.map(ingredient => (
              {
                ...ingredient,
                id: mainIdOrNullIfNew(section)
              } 
            ))
            : undefined
        })) 
      }
      const res = await api.post("/recipes", sanitizedBody);
      return res.data;
    }
  });

  const createRecipe = (body: RecipeModel, onSuccess: (data: RecipeModel) => void) => createRecipeMutation.mutate(body, { onSuccess })

  const updateRecipe = useMutation({
    mutationFn: async (recipe: RecipeModel) => {
      const bodyWithoutTrackingIds = { 
        ...recipe, 
        id: mainIdOrNullIfNew(recipe),
        sections: recipe.sections.map(section => ({
          ...section, 
          id: mainIdOrNullIfNew(section),
          recipeId: idOrNullIfNew(recipe.id, recipe.isNew),
          ...(section.type === 'INGREDIENTS' && {
            ingredients: section.ingredients?.map(ingredient => ({
              ...ingredient, 
              id: mainIdOrNullIfNew(ingredient),
              recipeSectionId: idOrNullIfNew(section.id, section.isNew)              
            }))
          })  
        }))
      }
      //bodyWithoutTrackingIds.sections = normalizeRecipeSectionsSortOrder(bodyWithoutTrackingIds.sections as RecipeSectionModel[])
      const res = await api.put(`/recipes`, bodyWithoutTrackingIds);
      return res.data;
    },
  });


  const deleteRecipe = useMutation({
      mutationFn: async (recipeId: string) => {
        const res = await api.delete(`/recipes/${recipeId}`);
        return res.data;
      },
    });


  return {
    get,
    updateRecipe,
    createRecipe,
    deleteRecipe
  };
};