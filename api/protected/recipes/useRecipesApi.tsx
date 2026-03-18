import { queryClient } from '@/components/common/queryClient/queryClient';
import { nullIfTrackingIdElseKeep } from '@/components/common/utils';
import { RecipeModel, RecipeSchema } from '@/components/protected/recipes/recipe-model';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';


export const useRecipesApi = (ownerId: string) => {

  // Fetches list of recipes but ignores items that that do not pass validation
  const get = (ownerId: string, onSuccess: (data: RecipeModel[]) => void) =>
    useQuery<RecipeModel[], Error>({
      queryKey: ['recipes', ownerId],
      queryFn: async () => {
        const res = await fetch(`http://localhost:8080/recipes?ownerId=${ownerId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch recipes')

        const json = await res.json()
        if (!Array.isArray(json)) throw new Error('Response is not array')

        // TODO: This is problem, if recipe has one ingredient not passing validation whole recipe won't show.
        const result = json
          .map(recipe => RecipeSchema.safeParse(recipe).data)
          .filter((r): r is RecipeModel => r != undefined) 
        console.log(json
          .map(recipe => RecipeSchema.safeParse(recipe))
          .filter(r => !r.success)
          .map(r => r.error.issues)
        )
      
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
        id: nullIfTrackingIdElseKeep(body.id),
        sections: body.sections.map(section => ({
          ...section, 
          id: nullIfTrackingIdElseKeep(section.id),
          ingredients: 
            section.type == 'INGREDIENTS' ? 
            section.ingredients.map(ingredient => (
              {
                ...ingredient,
                id: nullIfTrackingIdElseKeep(section.id)
              } 
            ))
            : undefined
        })) 
      }
      const res = await fetch(`http://localhost:8080/recipes`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedBody),
          credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create recipes');
      return res.json();
    }
  });

  const createRecipe = (body: RecipeModel, onSuccess: (data: RecipeModel) => void) => createRecipeMutation.mutate(body, { onSuccess })
  
  const updateRecipe = useMutation({
    mutationFn: async (body: RecipeModel) => {
      const bodyWithoutTrackingIds = { 
        ...body, 
        sections: body.sections.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)})) 
      }
      const sanitizedBody = RecipeSchema.parse(bodyWithoutTrackingIds)
      const res = await fetch(`http://localhost:8080/recipes`, {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedBody),
          credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update recipes');
    },
  });


  const deleteRecipe = useMutation({
      mutationFn: async (recipeId: string) => {
          const res = await fetch(`http://localhost:8080/recipes/${recipeId}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
              credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to delete recipes');
      },
    });


  return {
    get,
    updateRecipe,
    createRecipe,
    deleteRecipe
  };
};