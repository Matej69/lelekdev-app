'use client';

import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider";
import ContentLoadingSkeleton from "@/components/common/Skeleton/content-loading-skeleton";
import { generateTrackingId } from "@/components/common/utils";
import { TaskModel, TaskSchema } from "@/components/protected/tasks/model";
import Task from "@/components/protected/tasks/task";
import { TaskFormProvider } from "@/components/protected/tasks/TaskFormProvider";
import { TasksArray } from "@/components/protected/tasks/TasksArray";
import { useUserContext } from "@/components/protected/user/userContext/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus } from "lucide-react";
import { useContext, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
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

export default function TasksPage() {
  //const taskData = mockTasks
  const { id: userId } = useUserContext()
  const taskApi = useTasksApi(userId)

  const form = useForm<{ tasks: TaskModel[] }>({
    resolver: zodResolver(z.object({ tasks: z.array(TaskSchema) })) as Resolver<{ tasks: TaskModel[] }>,
    defaultValues: { tasks: [] }
  });
  
  const tasks = taskApi.get(userId, (data) => { form.reset({ tasks: data }) } )
  if (tasks.isLoading)
    return <Loading/>;


  return (
    <div className="flex flex-col h-full font-sans gap-6">
      <div className="flex justify-center items-center">
        <h1 className="text-5xl font-bold grow">Tasks</h1>
        <div id="add-task-placeholder"></div>
      </div>
        <TaskFormProvider form={form}>
          <TasksArray/>
        </TaskFormProvider>
    </div>
  );
}
