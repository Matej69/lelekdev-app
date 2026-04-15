import { DragDropDraggable, DragDropDraggableProps } from '@/components/common/drag-drop/DragDropDraggable';
import { DragDropDroppable, DragDropDroppableProps } from '@/components/common/drag-drop/DragDropDroppable';
import { DragDropHandlerContext } from '@/components/common/drag-drop/DragDropProvider';
import { registerShortcutListener, unregisterShortcutListener } from '@/components/common/shortcuts-registration/shortcuts-registration';
import { safeCreatePortal } from '@/components/common/utils';
import Recipe from '@/components/protected/recipes/recipe';
import { RecipeModel } from '@/components/protected/recipes/recipe-model';
import { useRecipes } from '@/components/protected/recipes/useRecipes';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { CopyPlus } from 'lucide-react';
import React, { ReactPortal, useContext, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface RecipesArrayProps {
    
}

export const RecipesArray = (p: RecipesArrayProps) => {

    const recipesActions = useRecipes()
    
    const form = useFormContext<{recipes: RecipeModel[]}>()
    const recipes = form.watch("recipes")


    const dragDropContext = useContext(DragDropHandlerContext)
    const [addTaskPortal, setAddTaskPortal] = useState<ReactPortal | null>(null) 

    useEffect(() => {
        dragDropContext.registerHandler(`recipe`, recipesActions.moveRecipe)
        const portal = safeCreatePortal(
          <CopyPlus size={52} className="ml-4 border border-gray-300 rounded cursor-pointer p-2 bg-white" onClick={recipesActions.createRecipe} />, 
          'add-recipe-placeholder'
        ) 
        setAddTaskPortal(portal)
        // Recipe section shortcuts
        const createSectionShortcutListener = registerShortcutListener('recipe-section', 'create', (data) => {recipesActions.createRecipeSectionAtIndex(data.recipeIndex, data.recipeSectionIndex)})
        const deleteSectionShortcutListener = registerShortcutListener('recipe-section', 'delete', (data) => {recipesActions.deleteRecipeSection(data.recipeIndex, data.recipeSectionIndex)})
        const saveSectionShortcutListener = registerShortcutListener('recipe-section', 'save', (data) => {recipesActions.updateRecipe(data.recipeIndex)})
        const moveSectionUpShortcutListener = registerShortcutListener('recipe-section', 'moveUp', (data) => {recipesActions.moveRecipeSectionUp(data.recipeIndex, data.recipeSectionIndex)})
        const moveSectionDownShortcutListener = registerShortcutListener('recipe-section', 'moveDown', (data) => {recipesActions.moveRecipeSectionDown(data.recipeIndex, data.recipeSectionIndex)})
        const duplicateSectionShortcutListener = registerShortcutListener('recipe-section', 'duplicate', (data) => {recipesActions.duplicateRecipeSectionAtIndex(data.recipeIndex, data.recipeSectionIndex)})
        // Ingredient shortcuts
        const createIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'create', (data) => {recipesActions.createIngredientAtIndex(data.recipeIndex, data.recipeSectionIndex, data.recipeSectionIngredientIndex)}) 
        const deleteIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'delete', (data) => {recipesActions.deleteIngredient(data.recipeIndex, data.recipeSectionIndex, data.recipeSectionIngredientIndex)})
        const saveIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'save', (data) => {recipesActions.updateRecipe(data.recipeIndex)})
        const moveUpIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'moveUp', (data) => {recipesActions.moveIngredientUp(data.recipeIndex, data.recipeSectionIndex, data.recipeSectionIngredientIndex)})
        const moveDownIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'moveDown', (data) => {recipesActions.moveIngredientDown(data.recipeIndex, data.recipeSectionIndex, data.recipeSectionIngredientIndex)})
        const duplicateIngredientShortcutListener = registerShortcutListener('recipe-section-ingredient', 'duplicate', (data) => {recipesActions.duplicateIngredientAtIndex(data.recipeIndex, data.recipeSectionIndex, data.recipeSectionIngredientIndex)})
        return () => {    
          // Recipe section shortcuts
          unregisterShortcutListener(createSectionShortcutListener)
          unregisterShortcutListener(deleteSectionShortcutListener)
          unregisterShortcutListener(saveSectionShortcutListener)
          unregisterShortcutListener(moveSectionUpShortcutListener)
          unregisterShortcutListener(moveSectionDownShortcutListener)
          unregisterShortcutListener(duplicateSectionShortcutListener)
          // Ingredient shortcuts  
          unregisterShortcutListener(createIngredientShortcutListener)
          unregisterShortcutListener(deleteIngredientShortcutListener)
          unregisterShortcutListener(saveIngredientShortcutListener)
          unregisterShortcutListener(moveUpIngredientShortcutListener)
          unregisterShortcutListener(moveDownIngredientShortcutListener)
          unregisterShortcutListener(duplicateIngredientShortcutListener)
        }
    }, [])


    const droppableItemIds = recipes?.map(r => ({ id: `recipe-draggable-${r.id}` })) || []

    const droppableRecipeProps: Omit<DragDropDroppableProps, 'children'> = {
      id: 'recipe-container',
      type: 'recipe-container',
      acceptTypes: ["recipe"],
      items: droppableItemIds,
      item: {},
    };

    const draggableRecipeProps = (recipe: { id: string }, index: number): Omit<DragDropDraggableProps, 'children'> => ({
      id: `recipe-draggable-${recipe.id}`,
      index: index,
      type: "recipe",
      acceptTypes: ["recipe"],
      containerId: "recipe-container",
      item: recipe,
    });

    return (
        <DragDropDroppable {...droppableRecipeProps} style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '4rem' }}>
            { addTaskPortal }
            {
              recipes?.map((recipe, i) => { return (
                <DragDropDraggable key={`${recipe.id}-${i}`} {...draggableRecipeProps(recipe, i)}>
                  <Recipe recipeIndex={i}></Recipe>
                </DragDropDraggable>
              )})
            }  
        </DragDropDroppable>
    )
}


