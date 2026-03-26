import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "../tasks/model"
import { generateTrackingId, maxPlus1Or1 } from "@/components/common/utils"
import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form"
import { TaskItemModel } from "../tasks/item/model"
import { normalizeTaskItemsSortOrder } from "../tasks/utils"
import { taskColors } from "../tasks/constants"
import { useRecipesApi } from "@/api/protected/recipes/useRecipesApi"
import { RecipeModel, RecipeSchema } from "./recipe-model"
import { useQuery } from "@tanstack/react-query"
import { RecipeSectionModel } from "./sections/recipe-section-schema"
import { RecipeSectionType } from "./sections/type"
import { IngredientModel } from "./sections/ingredient/ingredient-model"
import { RecipeIngredientSectionModel, RecipeIngredientSectionModelSchema } from "./sections/ingredient/recipe-ingredient-section-model"
import { RecipeTextSectionModel } from "./sections/text/recipe-text-section-model"
import { normalizeIngredientsSortOrder, normalizeRecipeSectionsSortOrder, normalizeRecipeSortOrder } from "./utils"
import { DragDropResult } from "@/components/common/drag-drop/DragDropResult"
import { Active, Over } from "@dnd-kit/core"
import { arrayMove, arraySwap } from "@dnd-kit/sortable"

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

    const deleteRecipe = async (index: number) => {
      const recipes = form.getValues().recipes
      const recipeToDelete = recipes[index]
      recipeService.deleteRecipe.mutate(recipeToDelete.id, {
        onSuccess: () => {
          const newRecipes = recipes.filter(r => r.id != recipeToDelete.id) 
          form.setValue('recipes', newRecipes)
        }
      })
    };

    const changeRecipeColor = (index: number, color: string) => {
      form.setValue(`recipes.${index}.color`, color, { shouldDirty: true })
    }

    const updateRecipe = async (recipeIndex: number) => {
      const recipeToUpdate = form.getValues(`recipes`)[recipeIndex]
      const isFormValid = await form.trigger(`recipes.${recipeIndex}`);
      if (!isFormValid) return;
      const res = await recipeService.updateRecipe.mutateAsync(recipeToUpdate)
      if(!res) return;
      form.resetField(`recipes.${recipeIndex}`, {
        keepDirty: false,
        defaultValue: form.getValues(`recipes.${recipeIndex}`),
      });
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

    const swapRecipeSection = (activeContainerId: string | null, overContainerId: string, activeIndex: number, overIndex: number) => {
      console.log(activeContainerId)
      console.log(overContainerId)
      console.log(activeIndex)
      console.log(overIndex)
      const swapInSameRecipeSection = activeContainerId === overContainerId
      if(swapInSameRecipeSection) {
        const recipe = {...form.getValues(`recipes`).find(r => r.id == overContainerId)}
        if(recipe.sections) {
          let newSections = arrayMove(recipe.sections, activeIndex, overIndex)
          newSections = normalizeRecipeSectionsSortOrder(newSections)
          const recipeIndex = form.getValues(`recipes`).findIndex(r => r.id == overContainerId)
          form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
        }
      }
      const swapInDifferentRecipeSection = activeContainerId !== overContainerId
      if(swapInDifferentRecipeSection) {
        console.log("DIFFERENT SECTION")
        const recipes = [...form.getValues('recipes')]
        const activeRecipe = recipes.find(r => r.id == activeContainerId)
        const overRecipe = recipes.find(r => r.id == overContainerId)
        if(activeRecipe?.sections && overRecipe?.sections) {
          console.log(activeRecipe.sections[activeIndex])
          activeRecipe.sections[activeIndex].recipeId = overContainerId
          const sectionToMove = activeRecipe?.sections.find((s, i) => i === activeIndex)
          const freshSectionToMove: RecipeSectionModel = {
            ...sectionToMove, 
            //id: generateTrackingId(), 
            recipeId: overContainerId, 
            ...(sectionToMove?.type === 'INGREDIENTS' && { ingredients: sectionToMove.ingredients.map(ingr => ({...ingr, id: generateTrackingId()}))})
          }
          activeRecipe?.sections.splice(activeIndex, 1) // Removes from source index
          overRecipe?.sections.splice(overIndex, 0, freshSectionToMove) // Adds to destination index


          //newSections = normalizeRecipeSectionsSortOrder(newSections)
          //const recipeIndex = form.getValues(`recipes`).findIndex(r => r.id == overContainerId)
          //console.log("swapz")
          //form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })

          const normalizedItems = normalizeRecipeSortOrder(recipes) // Reassigns task order to be same as index
          form.setValue('recipes', normalizedItems, {shouldDirty: true})
        }
      }
    }

    const moveRecipeSection = (result: DragDropResult): void => {
      const droppedOnSamePlace =
        result.initial.containerId == result.target.containerId && 
        result.initial.itemIndex == result.target.itemIndex
      if(droppedOnSamePlace) return;
      // Find section that is moving
      const recipes = [...form.getValues('recipes')]
      const sourceRecipe = recipes.find(r => r.id === result.initial.containerId)
      const destinationRecipe = recipes.find(r => r.id === result.target.containerId)
      const sectionToMove = sourceRecipe?.sections.find(s => s.id === result.dragged.id)
      if(!sourceRecipe || !destinationRecipe || !sectionToMove) return;
      const freshSectionToMove: RecipeSectionModel = {
        ...sectionToMove, 
        id: generateTrackingId(), 
        recipeId: destinationRecipe?.id, 
        ...(sectionToMove?.type === 'INGREDIENTS' && { ingredients: sectionToMove.ingredients.map(ingr => ({...ingr, id: generateTrackingId()}))})
      }
      sourceRecipe?.sections.splice(result.initial.itemIndex, 1) // Removes from source index
      destinationRecipe?.sections.splice(result.target.itemIndex, 0, freshSectionToMove) // Adds to destination index
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
      swapRecipeSection,
      moveRecipeSection,
      createIngredient,
      deleteIngredient,
      changeIngredientAmount,
      duplicateRecipeSection
    }
}