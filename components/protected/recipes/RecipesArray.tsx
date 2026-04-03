import { DragDropDraggable } from '@/components/common/drag-drop/DragDropDraggable';
import { DragDropDroppable } from '@/components/common/drag-drop/DragDropDroppable';
import { DragDropHandlerContext } from '@/components/common/drag-drop/DragDropProvider';
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
    const recipes = useWatch({
        control: form.control
    }).recipes


    const dragDropContext = useContext(DragDropHandlerContext)
    const [addTaskPortal, setAddTaskPortal] = useState<ReactPortal | null>(null) 

    useEffect(() => {
        dragDropContext.registerHandler(`recipe`, recipesActions.moveRecipe)
        const portal = safeCreatePortal(
          <CopyPlus size={52} className="ml-4 border border-gray-300 rounded cursor-pointer p-2 bg-white" onClick={recipesActions.createRecipe} />, 
          'add-recipe-placeholder'
      ) 
      setAddTaskPortal(portal)
    }, [])

    const droppableItemIds = recipes?.map(r => ({ id: `recipe-draggable-${r.id}` })) || []

    return (
        <DragDropDroppable
            id={'recipe-container'} item={{}} items={droppableItemIds} type="recipe-container" acceptTypes={["recipe"]}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '4rem' }}>
            { addTaskPortal }
            {
              recipes?.map((recipe, i) => { return (
                <DragDropDraggable item={recipe} id={`recipe-draggable-${recipe.id}`} containerId={"recipe-container"} index={i} type="recipe" acceptTypes={["recipe"]} key={`recipe-${recipe.id}`}>
                  <Recipe key={`${recipe.id}-${i}`} recipeIndex={i}></Recipe>
                </DragDropDraggable>
              )})
            }  
        </DragDropDroppable>
    )
}


