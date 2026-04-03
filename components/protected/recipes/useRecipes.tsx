import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "../tasks/model"
import { forceFormDirtiness, generateTrackingId, maxPlus1Or1, moveAcrossCollections, moveInCollection } from "@/components/common/utils"
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
    recipes.forEach((recipe, i) => { if(i > 0) recipe.sortOrder += 1}) // Push other recipes down
    form.setValue('recipes', recipes);
  })
}

export const useRecipes = () => {
    const { id: userId } = useUserContext()
    const recipesApi = useRecipesApi(userId)
    const form = useFormContext<{recipes: RecipeModel[]}>()

    const createRecipe = () => {
      const newRecipe: RecipeModel = {
        id: generateTrackingId(),
        isNew: true,
        ownerId: userId,
        name: "new",
        color: taskColors.beige,
        sortOrder: 1,
        sections: [],
      }
      recipesApi.createRecipe(
        newRecipe, 
        (recipeRecieved) => {
          const recipes = [recipeRecieved, ...form.getValues('recipes')]
          recipes.forEach((task, i) => { if(i > 0) task.sortOrder += 1})
          form.setValue('recipes', recipes)
        })
    }

    const deleteRecipe = async (index: number) => {
      let recipes = [...form.getValues().recipes]
      const recipeToDelete = recipes[index]
      recipesApi.deleteRecipe.mutate(recipeToDelete.id, {
        onSuccess: () => {
          recipes = recipes.filter(r => r.id != recipeToDelete.id) 
          recipes.forEach((r, i) => { r.sortOrder = i >= index ? r.sortOrder - 1 : r.sortOrder}) // Move up recipes after deleted one
          form.setValue('recipes', recipes)
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
      const res = await recipesApi.updateRecipe.mutateAsync(recipeToUpdate)
      if(!res) return;
      form.resetField(`recipes.${recipeIndex}`, {
        keepDirty: false,
        defaultValue: form.getValues(`recipes.${recipeIndex}`),
      });
    }

    const moveRecipe = (dragEvent: DragEvent) => {
      const { active, over } = dragEvent
      const isDraggingRecipe = active.type === 'recipe'
      const draggingInsideSameContainer = !isDraggingRecipe || active.groupId !== over.groupId 
      if(draggingInsideSameContainer)
        return;
      const recipes = form?.getValues(`recipes`)
      if(over.index != null) {
        let newRecipes = moveInCollection(recipes, active.index, over.index)
        form.setValue(`recipes`, newRecipes, { shouldDirty: true })
        recipesApi.updateRecipe.mutate(newRecipes[over.index])
      }
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
      forceFormDirtiness(form, `recipes.${recipeIndex}.sections`)
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

    const newShallowCopySectionFromExisting = (section: RecipeSectionModel, recipeId: string) => {
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

      // Dragged to another position within same recipe
      if(dragState.groupEquality == 'SAME' && dragState.draggedTo == 'NON_EMPTY_CONTAINER') {
        const recipe = {...form.getValues(`recipes`).find(r => r.id == over.groupId)}
        if(recipe.sections && over.index != null) {
          console.log("Over id:", over.groupId)
          const newSections = moveInCollection(recipe.sections, active.index, over.index)
          const recipeIndex = form.getValues(`recipes`).findIndex(r => r.id == over.groupId)
          form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
        }
      }
      // Dragged to another recipe with at least one section
      else if(dragState.groupEquality == 'DIFFERENT' && dragState.draggedTo == 'NON_EMPTY_CONTAINER') {
        const recipes = [...form.getValues('recipes')]
        const activeRecipe = recipes.find(r => r.id == active.groupId)
        const overRecipe = recipes.find(r => r.id == over.groupId)
        if(activeRecipe?.sections && overRecipe?.sections && activeRecipe.sections.length > active.index && over.groupId && over.index != null) {
          //activeRecipe.sections[active.index].recipeId = over.groupId
          console.log("Over id:", over.groupId)
          moveAcrossCollections(
            activeRecipe.sections, active.index,
            overRecipe.sections, over.index,
            (itemToMove) => newShallowCopySectionFromExisting(itemToMove, over.groupId!)
          )
          const activeRecipeIndex = recipes.findIndex(r => r.id == active.groupId)
          forceFormDirtiness(form, `recipes.${activeRecipeIndex}`)
          form.setValue('recipes', recipes, {shouldDirty: true})
        }
      }
      // Dragged to another recipe with no sections
      else if (dragState.groupEquality == 'DIFFERENT' && dragState.draggedTo == 'EMPTY_CONTAINER') {
        const recipes = [...form.getValues('recipes')]
        const activeRecipe = recipes.find(r => r.id == active.groupId)
        const overRecipe = recipes.find(r => r.id == over.id)
        if(activeRecipe?.sections && overRecipe?.sections && activeRecipe.sections.length > active.index) {
          activeRecipe.sections[active.index].recipeId = over.id
          moveAcrossCollections(
            activeRecipe.sections, active.index,
            overRecipe.sections, 0,
            (itemToMove) => newShallowCopySectionFromExisting(itemToMove, over.id!)
          )
          const activeRecipeIndex = recipes.findIndex(r => r.id == active.groupId)
          forceFormDirtiness(form, `recipes.${activeRecipeIndex}`)
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
    forceFormDirtiness(form, `recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)
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
    form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
  }


    return {
      form,
      createRecipe,
      changeRecipeColor,
      deleteRecipe,
      updateRecipe,
      moveRecipe,
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