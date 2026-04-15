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
      const { dragged, target, draggedOn } = dragEvent
      const isDraggingRecipe = dragged.type == 'recipe'
      const isDraggingToRecipe = target.type == 'recipe'
      if(!isDraggingRecipe || !isDraggingToRecipe || !draggedOn.sameContainer)
        return;
      if(target.index == null)
        return;
      const recipes = form?.getValues(`recipes`)
      let newRecipes = moveInCollection(recipes, dragged.index, target.index)
      form.setValue(`recipes`, newRecipes)
      recipesApi.updateRecipe.mutate(newRecipes[target.index])
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

    const createRecipeSectionAtIndex = (recipeIndex: number, sectionIndex: number) => {
      if(recipeIndex == null || sectionIndex == null)
        return;
      const recipeId = form.getValues(`recipes.${recipeIndex}.id`)
      const sections = form.getValues(`recipes.${recipeIndex}.sections`)
      const newSection: RecipeSectionModel = {
        id: generateTrackingId(),
        isNew: true,
        recipeId: recipeId,
        type: 'TEXT',
        title: '',
        content: '',
        sortOrder: maxPlus1Or1(sections, (s) => s.sortOrder)
      }
      const newSections = [...sections.slice(0, sectionIndex + 1), newSection, ...sections.slice(sectionIndex + 1)];
        const normalizedNewRecipes = normalizeRecipeSectionsSortOrder(newSections)
        form.setValue(`recipes.${recipeIndex}.sections`, normalizedNewRecipes, { shouldDirty: true })
        queueMicrotask(() => {
          form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex + 1}.title`);
        }); 
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
            recipeId, 
            ...(section?.type === 'INGREDIENTS' && { ingredients: section.ingredients.map(ingr => ({...ingr, isNew: true}))})
          } as RecipeSectionModel
    }

    const moveRecipeSection = async (dragEvent: DragEvent) => {
      const { dragged, target, activeSnapshot, draggedOn, action } = dragEvent
      const types = {
        item: 'recipe-section',
        container: 'recipe-section-container'
      }
      const isDraggingRecipeSection = dragged.type == types.item
      const isDraggingToItemOrContainer = [types.item, types.container].includes(target.type)
      if(!isDraggingRecipeSection || !isDraggingToItemOrContainer)
        return;
      const recipes = [...form.getValues('recipes')]
      // Dragged to different container
      if(action == 'drag-over' && !draggedOn.sameContainer && !draggedOn.sameItem) {
        const targetRecipeId = draggedOn.container ? target.id : target.groupId
        const targetRecipe = recipes.find(r => r.id == targetRecipeId)
        const draggedRecipe = recipes.find(r => r.id == dragged.groupId)
        const targetContainerEmpty = targetRecipe?.sections?.length == 0
        const indexToMoveItemTo = targetContainerEmpty ? 0 : target.index
        if(draggedRecipe?.sections && targetRecipe?.sections && dragged.index < draggedRecipe.sections.length && indexToMoveItemTo != null) {
          moveAcrossCollections(
            draggedRecipe.sections, dragged.index,
            targetRecipe.sections, indexToMoveItemTo,
            (itemToMove) => newShallowCopySectionFromExisting(itemToMove, targetRecipe.id)
          )
          form.setValue('recipes', recipes)
        }
      }
      else if(action == 'drag-end') {
        // Dragged in same container
        if(draggedOn.sameContainer && !draggedOn.sameItem) {
          const recipeIndex = recipes.findIndex(r => r.id == target.groupId)
          const recipe = {...recipes[recipeIndex]}
          if(target.index != null) {
            recipe.sections = moveInCollection(recipe.sections || [], dragged.index, target.index)
            const shouldDirty = dragged.groupId === activeSnapshot.groupId
            form.setValue(`recipes.${recipeIndex}.sections`, recipe.sections, { shouldDirty })
          }
        }
        // Dragged to different container - commit changes - automatically save since its weird to manually save both containers when item moves
        const differentContainerFromSnapshot = dragged.groupId !== activeSnapshot.groupId 
        if(differentContainerFromSnapshot) {
          const originRecipe = recipes.find(r => r.id == dragEvent.activeSnapshot.groupId)
          const targetRecipeId = target.type == types.item ? target.groupId : target.id 
          const targetRecipe = recipes.find(r => r.id == targetRecipeId)
          if(originRecipe && targetRecipe) {
              const originRecipeIndex = recipes.findIndex(r => r.id === originRecipe.id) 
              updateRecipe(originRecipeIndex)
              const targetRecipeIndex = recipes.findIndex(r => r.id === targetRecipe.id) 
              updateRecipe(targetRecipeIndex)
          }
        }
      }
    }

    const moveRecipeSectionUp = (recipeIndex: number, sectionIndex: number) => {
      const sections = form.getValues(`recipes.${recipeIndex}.sections`)
      if(!sections || sections.length <= 1 || sectionIndex <= 0 || sectionIndex >= sections.length) 
        return;
      const newSections = moveInCollection(sections, sectionIndex, sectionIndex - 1)
      form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
      queueMicrotask(() => {
        form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex - 1}.title`);
      });
    }

    const moveRecipeSectionDown = (recipeIndex: number, sectionIndex: number) => {
      const sections = form.getValues(`recipes.${recipeIndex}.sections`)
      if(!sections || sections.length <= 1 || sectionIndex < 0 || sectionIndex >= sections.length - 1)
        return;
      const newSections = moveInCollection(sections, sectionIndex, sectionIndex + 1)
      form.setValue(`recipes.${recipeIndex}.sections`, newSections, { shouldDirty: true })
      queueMicrotask(() => {
        form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex + 1}.title`);
      });
    }


  const createIngredient = (recipeIndex: number, sectionIndex: number) => {
    let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
    const sectionId = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.id`)
    ingredients.push({
      id: generateTrackingId(),
      isNew: true,
      name: '',
      amount: '',
      unit: '',
      kcal: 0,
      sortOrder: maxPlus1Or1(ingredients, (ing) => ing.sortOrder),
      recipeSectionId: sectionId.startsWith('[new]') ? null : sectionId
    })
    form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, ingredients, { shouldDirty: true})
  }

  const createIngredientAtIndex = (recipeIndex: number, sectionIndex: number, ingredientIndex: number) => { 
      if(recipeIndex == null || sectionIndex == null || ingredientIndex == null)
          return;
        let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
        const sectionId = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.id`)
        const newRecipe: IngredientModel = {
          id: generateTrackingId(),
          isNew: true,
          name: '',
          amount: '',
          unit: '',
          kcal: 0,
          sortOrder: maxPlus1Or1(ingredients, (ing) => ing.sortOrder),
          recipeSectionId: sectionId.startsWith('[new]') ? null : sectionId
        }
        const newRecipes = [...ingredients.slice(0, ingredientIndex + 1), newRecipe, ...ingredients.slice(ingredientIndex + 1)];
        const normalizedNewRecipes = normalizeIngredientsSortOrder(newRecipes)
        form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, normalizedNewRecipes, { shouldDirty: true })
        queueMicrotask(() => {
          form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients.${ingredientIndex + 1}.amount`);
        });
      };

  const deleteIngredient = (recipeIndex: number, sectionIndex: number, ingredientIndex: number) => {
    let ingredients = [...form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)]
    ingredients.splice(ingredientIndex, 1)
    ingredients = normalizeIngredientsSortOrder(ingredients)
    form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, ingredients, { shouldDirty: true})
    forceFormDirtiness(form, `recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)
  }

  const newShallowCopyIngredientFromExisting = (ingredient: IngredientModel, sectionId: string) => {
    return {
      ...ingredient,
      isNew: true,
      recipeSectionId: sectionId,
    } as IngredientModel
  }

  const moveRecipeIngredient = (dragEvent: DragEvent) => {
      const { dragged, target, activeSnapshot, draggedOn, action } = dragEvent
      const types = {
        item: 'ingredient',
        container: 'ingredient-container'
      }
      const isDraggingIngredient = dragged.type == types.item
      const isDraggingToItemOrContainer = [types.item, types.container].includes(target.type)
      if(!isDraggingIngredient || !isDraggingToItemOrContainer)
        return;
      const recipes = [...form.getValues('recipes')]
      const sections = recipes.flatMap(r => r.sections).filter(s => s.type == 'INGREDIENTS') as RecipeIngredientSectionModel[]
      const ingredients = sections.flatMap(s => s.ingredients)
      // Dragged to different container
      if(action == 'drag-over' && !draggedOn.sameContainer && !draggedOn.sameItem) {
        const targetRecipeSectionId = draggedOn.container ? target.id : target.groupId
        const targetSection = sections.find(r => r.id == targetRecipeSectionId)
        const draggedSection = sections.find(r => r.id == dragged.groupId)
        const targetContainerEmpty = targetSection?.ingredients?.length == 0
        const indexToMoveItemTo = targetContainerEmpty ? 0 : target.index
        if(draggedSection?.ingredients && targetSection?.ingredients && draggedSection.ingredients.length > dragged.index && indexToMoveItemTo != null) {
          moveAcrossCollections(
            draggedSection.ingredients, dragged.index,
            targetSection.ingredients, indexToMoveItemTo,
            (itemToMove) => newShallowCopyIngredientFromExisting(itemToMove, targetSection.id)
          )
          form.setValue('recipes', recipes)
        }
      }
      else if(action == 'drag-end') {
        // Dragged in same container
        if(draggedOn.sameContainer && !draggedOn.sameItem) {
          const targetSection = sections.find(s => s.id == target.groupId) as RecipeIngredientSectionModel
          const targetRecipe = recipes.find(r => r.id == targetSection.recipeId)
          const targetRecipeIndex = recipes.findIndex(r => r.id == targetRecipe?.id)
          const targetSectionIndex = targetRecipe?.sections.findIndex(s => s.id == target?.groupId)
          const targetIngredientIndex = target.index
          if(targetRecipeIndex == null || targetSectionIndex == null || targetIngredientIndex == null)
            return;
          if(target.index != null) {
            targetSection.ingredients = moveInCollection(targetSection.ingredients || [], dragged.index, target.index)
            const shouldDirty = dragged.groupId === activeSnapshot.groupId
            form.setValue(`recipes.${targetRecipeIndex}.sections.${targetSectionIndex}.ingredients`, targetSection.ingredients, { shouldDirty })
          }
        }
        // Commit changes from drag to different empty or non empty container - automatically save(backend commit) since its weird to manually save both containers when item moves
        const differentContainerFromInitial = dragged.groupId !== activeSnapshot.groupId
        if(differentContainerFromInitial) {
          const originSection = sections.find(s => s.id == dragEvent.activeSnapshot.groupId)
          const originRecipe = recipes.find(r => r.id == originSection?.recipeId)
          const targetSectionId = target.type == types.item ? target.groupId : target.id 
          const targetSection = sections.find(s => s.id == targetSectionId)
          const targetRecipe = recipes.find(r => r.id == targetSection?.recipeId)
          if(!originRecipe || !targetRecipe)
            return;
          const sameRecipeIngredientMove = originRecipe == targetRecipe
          const differentRecipeIngredientMove = originRecipe != targetRecipe  
          if(sameRecipeIngredientMove)
            recipesApi.updateRecipe.mutate(originRecipe)
          else if (differentRecipeIngredientMove) {
            if(originRecipe && targetRecipe) {
              const originRecipeIndex = recipes.findIndex(r => r.id === originRecipe.id) 
              updateRecipe(originRecipeIndex)
              const targetRecipeIndex = recipes.findIndex(r => r.id === targetRecipe.id) 
              updateRecipe(targetRecipeIndex)
            }
          }
        }
      }
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

  const moveIngredientUp = (recipeIndex: number, sectionIndex: number, ingredientIndex: number) => {
      const ingredients = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)
      if(!ingredients || ingredients.length <= 1 || ingredientIndex <= 0 || ingredientIndex >= ingredients.length) 
        return;
      const newIngredients = moveInCollection(ingredients, ingredientIndex, ingredientIndex - 1)
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, newIngredients, { shouldDirty: true })
      queueMicrotask(() => {
        form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients.${ingredientIndex - 1}.name`);
      });
    }

    const moveIngredientDown = (recipeIndex: number, sectionIndex: number, ingredientIndex: number) => {
      const ingredients = form.getValues(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`)
      if(!ingredients || ingredients.length <= 1 || ingredientIndex < 0 || ingredientIndex >= ingredients.length - 1) 
        return; 
      const newIngredients = moveInCollection(ingredients, ingredientIndex, ingredientIndex + 1)
      form.setValue(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients`, newIngredients, { shouldDirty: true })
      queueMicrotask(() => {        
        form.setFocus(`recipes.${recipeIndex}.sections.${sectionIndex}.ingredients.${ingredientIndex + 1}.name`);
      });
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
      moveRecipeSectionUp,
      moveRecipeSectionDown,
      createIngredient,
      createIngredientAtIndex,
      deleteIngredient,
      changeIngredientAmount,
      moveRecipeIngredient,
      duplicateRecipeSection,
      moveIngredientUp,
      moveIngredientDown,
      createRecipeSectionAtIndex
    }
}