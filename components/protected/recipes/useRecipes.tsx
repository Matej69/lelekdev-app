import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "../tasks/model"
import { forceFormDirtiness, generateTrackingId, maxPlus1Or1 } from "@/components/common/utils"
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
import { Active, Over } from "@dnd-kit/core"
import { arrayMove, arraySwap } from "@dnd-kit/sortable"
import { DragEvent } from "@/components/common/drag-drop/DragEvent"

// Has to be outside of useRecipes hook since it is called outside of TaskFormProvider
export const createRecipe = (
  form: UseFormReturn<{recipes: RecipeModel[]}>, 
  userId: string, 
  mutateFun: (body: RecipeModel, onSuccess: (data: RecipeModel) => void
) => void) => {
  const recipes = form.getValues().recipes
  const newRecipe: RecipeModel = {
    id: generateTrackingId(),
    isNew: true,
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
      const errors = form.formState.errors.recipes?.[recipeIndex];
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
        isNew: true,
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

    const newSectionFromExisting = (section: RecipeSectionModel, recipeId: string) => {
      return {
            ...section,
            isNew: true,
            recipeId: recipeId, 
            ...(section?.type === 'INGREDIENTS' && { ingredients: section.ingredients.map(ingr => ({...ingr, isNew: true}))})
          } as RecipeSectionModel
    }

    const moveRecipeSection = (dragEvent: DragEvent) => {
      const { active, over } = dragEvent
      const isDraggingSection = active.type === 'recipe-section'
      const isDropLocationSectionOrSectionItem = over.type === 'recipe-section' || over.type === 'recipe-section-container'  
      if(!isDraggingSection || !isDropLocationSectionOrSectionItem)
        return;
      const overEmptyContainer = form.getValues(`recipes`).find(r => r.id == over.id)?.sections?.length == 0
      const dragState = {
        groupEquality: active.groupId === over.groupId ? 'SAME' : 'DIFFERENT',
        draggedTo: active.type !== over.type && overEmptyContainer ? 'EMPTY_CONTAINER' : 'NON_EMPTY_CONTAINER'
      } as const

      if(dragState.groupEquality == 'SAME' && dragState.draggedTo == 'NON_EMPTY_CONTAINER') {
        const recipe = {...form.getValues(`recipes`).find(r => r.id == over.groupId)}
        if(recipe.sections && over.index != null) {
          let newSections = arrayMove(recipe.sections, active.index, over.index)
          newSections = normalizeRecipeSectionsSortOrder(newSections)
          const recipeIndex = form.getValues(`recipes`).findIndex(r => r.id == over.groupId)
          form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
        }
      }
      
      else if(dragState.groupEquality == 'DIFFERENT' && dragState.draggedTo == 'NON_EMPTY_CONTAINER') {
        const recipes = [...form.getValues('recipes')]
        const activeRecipe = recipes.find(r => r.id == active.groupId)
        const overRecipe = recipes.find(r => r.id == over.groupId)
        if(activeRecipe?.sections && overRecipe?.sections && activeRecipe.sections.length > active.index && over.groupId && over.index != null) {
          activeRecipe.sections[active.index].recipeId = over.groupId
          const sectionToMove = activeRecipe?.sections.find((s, i) => i === active.index)
          const newSection = newSectionFromExisting(sectionToMove as RecipeSectionModel, over.groupId)
          activeRecipe?.sections.splice(active.index, 1) // Removes from source index
          activeRecipe.sections = normalizeRecipeSectionsSortOrder(activeRecipe?.sections)
          overRecipe?.sections.splice(over.index, 0, newSection) // Adds to destination index
          overRecipe.sections = normalizeRecipeSectionsSortOrder(overRecipe?.sections)
          form.setValue('recipes', recipes, {shouldDirty: true})
          const activeRecipeIndex = recipes.findIndex(r => r.id == active.groupId)
          forceFormDirtiness(form, `recipes.${activeRecipeIndex}`) // Needed since deleting last item doesn't trigger it
        }
      }
      
      else if (dragState.groupEquality == 'DIFFERENT' && dragState.draggedTo == 'EMPTY_CONTAINER') {
        const recipes = [...form.getValues('recipes')]
        const activeRecipe = recipes.find(r => r.id == active.groupId)
        const overRecipe = recipes.find(r => r.id == over.id)
        if(activeRecipe?.sections && overRecipe?.sections && activeRecipe.sections.length > active.index) {
          activeRecipe.sections[active.index].recipeId = over.id
          const sectionToMove = activeRecipe?.sections.find((s, i) => i === active.index)
          const newSection = newSectionFromExisting(sectionToMove as RecipeSectionModel, over.id)
          activeRecipe?.sections.splice(active.index, 1) // Removes from source index
          activeRecipe.sections = normalizeRecipeSectionsSortOrder(activeRecipe?.sections)
          overRecipe?.sections.push(newSection) // Adds to destination index
          overRecipe.sections = normalizeRecipeSectionsSortOrder(overRecipe?.sections)
          form.setValue('recipes', recipes, {shouldDirty: true})
        }
      }
    }

  const createIngredient = (recipeIndex: number, sectionIndex: number) => {
    let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
    const sectionId = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.id`)
    ingredients.push({
      id: generateTrackingId(),
      isNew: true,
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
    newSection.isNew = true
    if(newSection.type == 'INGREDIENTS') {
      newSection.ingredients.forEach(ingredient => {
        ingredient.id = generateTrackingId()
        ingredient.isNew = true,
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