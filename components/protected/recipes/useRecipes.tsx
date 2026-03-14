import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "../tasks/model"
import { generateTrackingId } from "@/components/common/utils"
import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form"
import { TaskItemModel } from "../tasks/item/model"
import { normalizeTaskItemsSortOrder } from "../tasks/utils"
import { taskColors } from "../tasks/constants"
import { DropResult, ResponderProvided } from "@hello-pangea/dnd"
import { useRecipesApi } from "@/api/protected/recipes/useRecipesApi"
import { RecipeModel, RecipeSchema } from "./recipe-model"
import { useQuery } from "@tanstack/react-query"

// Has to be outside of useRecipes hook since it is called outside of TaskFormProvider
export const createRecipe = (
  form: UseFormReturn<{recipes: RecipeModel[]}>, 
  userId: string, 
  mutateFun: (body: RecipeModel, onSuccess: (data: RecipeModel) => void
) => void) => {
  const recipes = form.getValues().recipes
  const nextFreeSortOrder = recipes.length == 0 ? 1 : Math.max(...recipes.map(r => r.sortOrder)) + 1
  const newRecipe: RecipeModel = {
    id: generateTrackingId(),
    ownerId: userId,
    name: "[NEW]",
    color: taskColors.beige,
    sortOrder: nextFreeSortOrder,
    sections: [],
  }
  mutateFun(newRecipe, (createdRecipe) => {
    newRecipe.id = createdRecipe.id
    recipes.push(newRecipe)
    form.setValue('recipes', recipes);
  })
}

export const useRecipes = () => {
    const { id: userId } = useUserContext()
    const recipeService = useRecipesApi(userId)
    const form = useFormContext<{recipes: RecipeModel[]}>()

    const deleteRecipe = (index: number) => {
      const recipes = form.getValues().recipes
      const recipeToDelete = recipes[index]
      const newRecipes = recipes.filter(r => r.id != recipeToDelete.id) 
      recipeService.deleteRecipe.mutate(recipeToDelete.id, {
        onSuccess: () => form.setValue('recipes', newRecipes)
      })
    };

    const changeRecipeColor = (index: number, color: string) => {
      form.setValue(`recipes.${index}.color`, color, { shouldDirty: true })
    }

    const updateRecipe = (index: number) => {
      const recipeToUpdate = form.getValues(`recipes`)[index]
      recipeService.updateRecipe.mutate(recipeToUpdate)
    }

    return {
      form,
      changeRecipeColor,
      deleteRecipe,
      updateRecipe,
      /*createTaskItem,
      deleteTaskItem,
      completeTaskItem,
      moveTaskItem*/
    }
}