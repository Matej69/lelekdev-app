import { FormProvider, Resolver, useForm, UseFormReturn } from "react-hook-form"
import { TaskModel, TaskSchema } from "./model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

type TaskFormProviderProps = {
    form:  UseFormReturn<{tasks: TaskModel[]}>
    children: React.ReactNode
}

export const TaskFormProvider = (p: TaskFormProviderProps) => {
    return <FormProvider {...p.form}>{ p.children}</FormProvider>
}