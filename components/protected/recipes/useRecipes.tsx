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
import { IngredientModel } from "./sections/ingredient/ingredient-model"
import { RecipeIngredientSectionModel, RecipeIngredientSectionModelSchema } from "./sections/ingredient/recipe-ingredient-section-model"
import { RecipeTextSectionModel } from "./sections/text/recipe-text-section-model"
import { normalizeIngredientsSortOrder, normalizeRecipeSectionsSortOrder, normalizeRecipeSortOrder } from "./utils"

// Has to be outside of useRecipes hook since it is called outside of TaskFormProvider
export const createRecipe = (
  form: UseFormReturn<{recipes: RecipeModel[]}>, 
  userId: string, 
  mutateFun: (body: RecipeModel, onSuccess: (data: RecipeModel) => void
) => void) => {
  const recipes = form.getValues().recipes
  const newRecipe: RecipeModel = {
    id: generateTrackingId(),
    ownerId: userId,
    name: "new",
    color: taskColors.beige,
    sortOrder: 1,
    sections: [],
  }
  mutateFun(newRecipe, (createdRecipe) => {
    newRecipe.id = createdRecipe.id
    recipes.splice(0, 0, newRecipe)
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
      if(form.formState.isDirty) {
        console.log("recipeToUpdate - dirty")
        console.log(recipeToUpdate)
        form.handleSubmit((data) => recipeService.updateRecipe.mutate(recipeToUpdate), (errors) => {
    // errors object from react-hook-form
    console.log('Form validation errors:', errors)
  })()
      }
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

    const changeRecipeSectionType = (recipeIndex: number, sectionIndex: number, newType: RecipeSectionType) => {
      const section = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}`)
      if(newType == 'INGREDIENTS') {
        (section as RecipeIngredientSectionModel).ingredients = []
      }
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.type`, newType, { shouldDirty: true })
    }

    const toogleSectionLinkEdit = (recipeIndex: number, sectionIndex: number) => {
      const value = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.linkedAmountUpdate`)
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.linkedAmountUpdate`, !value)
    }

    const changeIngredientAmount = (recipeIndex: number, sectionIndex: number, ingredientIndex: number, oldAmount: number, newAmount: number, linkedAmountUpdate: boolean) => {
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients.${ingredientIndex}.amount`, newAmount, { shouldDirty: true })
      // Change all other ingredients by same ratio, skip one that initiated amount change
      if(!linkedAmountUpdate || oldAmount == 0 || newAmount == 0) return;
      const changeAmountRatio = newAmount / oldAmount
      const newIngredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
      newIngredients.forEach((ingredient, i) => {
        if(i != ingredientIndex)
          ingredient.amount = Number((ingredient.amount * changeAmountRatio).toFixed(3))
      })
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, newIngredients, { shouldDirty: true })
    }

    const moveRecipeSection = (result: DropResult<string>): void => {
      if(!result.destination) return;
      const droppedOnSamePlace =
      result.source.droppableId == result.destination.droppableId && 
      result.source.index == result.destination?.index 
      if(droppedOnSamePlace) return;
      // Find section that is moving
      const recipes = [...form.getValues('recipes')]
      const sourceRecipe = recipes.find(r => r.id === result.source.droppableId)
      const destinationRecipe = recipes.find(r => r.id === result.destination?.droppableId)
      const sectionToMove = sourceRecipe?.sections.find(s => s.id === result.draggableId)
      if(!sourceRecipe || !destinationRecipe || !sectionToMove) return;
      const freshSectionToMove: RecipeSectionModel = {
        ...sectionToMove, 
        id: generateTrackingId(), 
        recipeId: destinationRecipe?.id, 
        ...(sectionToMove?.type === 'INGREDIENTS' && { ingredients: sectionToMove.ingredients.map(ingr => ({...ingr, id: generateTrackingId()}))})
      }
      sourceRecipe?.sections.splice(result.source.index, 1) // Removes from source index
      destinationRecipe?.sections.splice(result.destination.index, 0, freshSectionToMove) // Adds to destination index
      // Add to destination
      console.log(freshSectionToMove)
      const normalizedItems = normalizeRecipeSortOrder(recipes) // Reassigns task order to be same as index
      form.setValue('recipes', normalizedItems, {shouldDirty: true})
    }

  const createIngredient = (recipeIndex: number, sectionIndex: number) => {
    let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
    const sectionId = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.id`)
    ingredients.push({
      id: generateTrackingId(),
      name: '',
      amount: 0,
      unit: '',
      kcal: 0,
      sortOrder: maxPlus1Or1(ingredients, (ing) => ing.sortOrder),
      recipeSectionId: sectionId.startsWith('[new]') ? null : sectionId
    })
    form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, ingredients, { shouldDirty: true})
  }

  const deleteIngredient = (recipeIndex: number, sectionIndex: number, ingredientIndex: number) => {
    let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
    ingredients.splice(ingredientIndex, 1)
    ingredients = normalizeIngredientsSortOrder(ingredients)
    form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, ingredients, { shouldDirty: true})
  }

  const duplicateRecipeSection = (recipeIndex: number, sectionIndex: number) => {
    let newSections = [...form.getValues(`recipes.${recipeIndex}.sections`)]
    const newSection = structuredClone(newSections[sectionIndex])
    newSection.id = generateTrackingId()
    if(newSection.type == 'INGREDIENTS') {
      newSection.ingredients.forEach(ingredient => {
        ingredient.id = generateTrackingId()
        ingredient.recipeSectionId = null
    })}
    newSections.splice(sectionIndex, 0, newSection)
    newSections = normalizeRecipeSectionsSortOrder(newSections)
    form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
  }


    return {
      form,
      changeRecipeColor,
      deleteRecipe,
      updateRecipe,
      createRecipeSection,
      deleteRecipeSection,
      changeRecipeSectionType,
      toogleSectionLinkEdit,
      moveRecipeSection,
      createIngredient,
      deleteIngredient,
      changeIngredientAmount,
      duplicateRecipeSection
    }
}