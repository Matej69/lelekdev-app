import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "../tasks/model"
import { generateTrackingId, maxPlus1Or1 } from "@/components/common/utils"
import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form"
import { TaskItemModel } from "../tasks/item/model"
import { normalizeTaskItemsSortOrder } from "../tasks/utils"
import { taskColors } from "../tasks/constants"
import { DropResult, ResponderProvided } from "@hello-pangea/dnd"
import { useRecipesApi } from "@/api/protected/recipes/useRecipesApi"
import { RecipeModel, RecipeSchema } from "./recipe-model"
import { useQuery } from "@tanstack/react-query"
import { RecipeSectionModel } from "./sections/recipe-section-schema"
import { RecipeSectionType } from "./sections/type"

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
      if(form.formState.isDirty)
            form.handleSubmit((data) => recipeService.updateRecipe.mutate(recipeToUpdate))()
    }

    const createRecipeSection = (recipeIndex: number) => {
      const recipe = form.getValues(`recipes`)[recipeIndex]
      const newSection: RecipeSectionModel = {
        id: generateTrackingId(),
        recipeId: recipe.id,
        type: 'TEXT',
        title: '',
        content: '',
        sortOrder: maxPlus1Or1(recipe.sections, (s) => s.sortOrder)
      }
      recipe.sections.push(newSection)
      form.setValue(`recipes.${recipeIndex}`, recipe, { shouldDirty: true })
    }

    const deleteRecipeSection = (recipeIndex: number, sectionIndex: number) => {
      const newSections = [...form.getValues('recipes')[recipeIndex].sections]
      newSections.splice(sectionIndex, 1)
      form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
    }

    const changeRecipeSectionType = (recipeIndex: number, sectionIndex: number, type: RecipeSectionType) => {
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.type`, type, { shouldDirty: true })
    }

    return {
      form,
      changeRecipeColor,
      deleteRecipe,
      updateRecipe,
      createRecipeSection,
      deleteRecipeSection,
      changeRecipeSectionType
      /*
      completeTaskItem,
      moveTaskItem*/
    }
}