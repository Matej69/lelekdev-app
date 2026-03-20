'use client';

import { useRecipesApi } from "@/api/protected/recipes/useRecipesApi";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import Skeleton from "@/components/common/Skeleton/skeleton";
import Recipe from "@/components/protected/recipes/recipe";
import { RecipeModel, RecipeSchema } from "@/components/protected/recipes/recipe-model";
import { RecipeFormProvider } from "@/components/protected/recipes/RecipeFormProvider";
import { createRecipe } from "@/components/protected/recipes/useRecipes";
import Task from "@/components/protected/tasks/task";
import { TaskFormProvider } from "@/components/protected/tasks/TaskFormProvider";
import { useUserContext } from "@/components/protected/user/userContext/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus } from "lucide-react";
import { Resolver, useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from 'zod'

const Loading = () => {
  return(
    <div className="flex flex-col gap-4">
      <Skeleton/>
      <Skeleton/>
      <Skeleton/>
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
  const recipes = useWatch({
    control: form.control
  })
  
  const defaultRecipes = recipesApi.get(userId, (data) => {form.reset({recipes: data})})
  if (defaultRecipes.isLoading)
    return <Loading/>;

  const onCreateRecipe = () => { createRecipe(form, userId, recipesApi.createRecipe) }

  return (
    <div className="flex flex-col h-full font-sans gap-6">
      <div className="flex justify-center items-center">
        <h1 className="text-5xl font-bold grow">Recipes</h1>
        <CopyPlus size={48} className="ml-4 cursor-pointer" onClick={onCreateRecipe} />
      </div>
      {/* Recipe list */}
      <RecipeFormProvider form={form}>
        {
          recipes.recipes?.map((recipe, i) =>
            <Recipe key={`${recipe.id}-${i}`} index={i}></Recipe>
          )
        }
      </RecipeFormProvider>
    </div>
  );
}
