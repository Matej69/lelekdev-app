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
import { RecipesArray } from "@/components/protected/recipes/RecipesArray";
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

  const form = useForm<{ recipes: RecipeModel[] }>({
    resolver: zodResolver(z.object({ recipes: z.array(RecipeSchema) })) as Resolver<{ recipes: RecipeModel[] }>,
    defaultValues: { recipes: [] }
  });
  
  const recipes = recipesApi.get(userId, (data) => {form.reset({recipes: data})})
  if (recipes.isLoading)
    return <Loading/>;

  return (
    <div className="flex flex-col h-full font-sans gap-4">
      <div className="flex justify-center items-center">
        <h1 className="text-5xl font-bold grow">Recipes</h1>
        <div id="add-recipe-placeholder"></div>
      </div>
      {/* Recipe list */}
      <RecipeFormProvider form={form}>
        <RecipesArray></RecipesArray>
      </RecipeFormProvider>
    </div>
  );
}
