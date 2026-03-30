'use client';

import { useRecipesApi } from "@/api/protected/recipes/useRecipesApi";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { DragDropDraggable } from "@/components/common/drag-drop/DragDropDraggable";
import { DragDropDroppable } from "@/components/common/drag-drop/DragDropDroppable";
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider";
import ContentLoadingSkeleton from "@/components/common/Skeleton/content-loading-skeleton";
import Recipe from "@/components/protected/recipes/recipe";
import { RecipeModel, RecipeSchema } from "@/components/protected/recipes/recipe-model";
import { RecipeFormProvider } from "@/components/protected/recipes/RecipeFormProvider";
import { createRecipe, useRecipes } from "@/components/protected/recipes/useRecipes";
import Task from "@/components/protected/tasks/task";
import { TaskFormProvider } from "@/components/protected/tasks/TaskFormProvider";
import { useUserContext } from "@/components/protected/user/userContext/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus, FileX } from "lucide-react";
import { useContext, useEffect } from "react";
import { Resolver, useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from 'zod'

const Loading = () => {
  return(
    <div className="flex flex-col gap-4">
      <ContentLoadingSkeleton/>
      <ContentLoadingSkeleton/>
      <ContentLoadingSkeleton/>
    </div>
  )
}

export default function RecipesPage() {
  const { id: userId } = useUserContext()
  const recipesApi = useRecipesApi(userId)

  const recipesActions = useRecipes()
  
  const form = useForm<{ recipes: RecipeModel[] }>({
    resolver: zodResolver(z.object({ recipes: z.array(RecipeSchema) })) as Resolver<{ recipes: RecipeModel[] }>,
    defaultValues: { recipes: [] }
  });
  const recipes = useWatch({
    control: form.control
  })

    const dragDropContext = useContext(DragDropHandlerContext)
    useEffect(() => {
      dragDropContext.registerHandler(`recipe-section`, recipesActions.moveRecipe)
    }, [])
  
  const defaultRecipes = recipesApi.get(userId, (data) => {form.reset({recipes: data})})
  if (defaultRecipes.isLoading)
    return <Loading/>;

  const onCreateRecipe = () => { createRecipe(form, userId, recipesApi.createRecipe) }

  return (
    <div className="flex flex-col h-full font-sans gap-4">
      <div className="flex justify-center items-center">
        <h1 className="text-5xl font-bold grow">Recipes</h1>
        <CopyPlus size={52} className="border border-gray-300 rounded cursor-pointer p-2 bg-white" onClick={onCreateRecipe} />
      </div>
      {/* Recipe list */}
      <RecipeFormProvider form={form}>
        {/*
          recipes.recipes?.map((recipe, i) =>
            <Recipe key={`${recipe.id}-${i}`} recipeIndex={i}></Recipe>
          )
          */
        }
        <DragDropDroppable 
          id={'recipe-container'} item={recipes.recipes} items={recipes.recipes || []} type="recipe-container" acceptTypes={["recipe"]}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '4rem' }}>
          {
            recipes.recipes?.map((recipe, i) => { return (
              <DragDropDraggable item={recipe} id={recipe.id!} containerId={"not.important-remove later"} index={i} type="recipe" key={`${recipe.id}`}>
                <Recipe key={`${recipe.id}-${i}`} recipeIndex={i}></Recipe>
              </DragDropDraggable>
            )})
          }  
        </DragDropDroppable>  
      </RecipeFormProvider>
    </div>
  );
}
