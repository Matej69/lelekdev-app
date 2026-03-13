import { FormProvider, Resolver, useForm, UseFormReturn } from "react-hook-form"
import { TaskModel, TaskSchema } from "../tasks/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { RecipeModel, RecipeSchema } from "./recipe-model";
import { z } from 'zod'

type RecipeFormProviderProps = {
    form: UseFormReturn<{recipes: RecipeModel[]}>
    children: React.ReactNode
}

export const RecipeFormProvider = (p: RecipeFormProviderProps) => {
    return <FormProvider {...p.form}>{ p.children}</FormProvider>
}