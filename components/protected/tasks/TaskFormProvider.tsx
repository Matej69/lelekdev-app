import { FormProvider, Resolver, useForm } from "react-hook-form"
import { TaskModel, TaskSchema } from "./model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

type TaskFormProviderProps = {
    defaultValues: TaskModel,
    children: React.ReactNode
}

export const TaskFormProvider = (p: TaskFormProviderProps) => {
    const form = useForm<TaskModel>({
         resolver: zodResolver(TaskSchema) as Resolver<TaskModel>,
         defaultValues: p.defaultValues
       });

    useEffect(() => {
  form.reset(p.defaultValues)
}, [p.defaultValues.id, p.defaultValues.title, p.defaultValues.items])

    return <FormProvider {...form}>{ p.children}</FormProvider>
}