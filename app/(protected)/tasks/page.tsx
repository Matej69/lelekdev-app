'use client';

import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { DragDropHandlerContext } from "@/app/DragDropProvider";
import Skeleton from "@/components/common/Skeleton/skeleton";
import { generateTrackingId } from "@/components/common/utils";
import { TaskModel } from "@/components/protected/tasks/model";
import Task from "@/components/protected/tasks/task";
import { TaskFormProvider } from "@/components/protected/tasks/TaskFormProvider";
import { createTask } from "@/components/protected/tasks/useTasks";
import { useUserContext } from "@/components/protected/user/userContext/UserContext";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { CopyPlus } from "lucide-react";
import { useContext, useEffect } from "react";

const Loading = () => {
  return(
    <div className="flex flex-col gap-4">
      <Skeleton/>
      <Skeleton/>
      <Skeleton/>
    </div>
  )
}

export default function TasksPage() {
  //const taskData = mockTasks
  const { id: userId } = useUserContext()
  const taskService = useTasksApi(userId)
  
  if (taskService.get.isLoading)
    return <Loading/>;
  
  const tasks = taskService.get.data || [];

  const onCreate = () => createTask(userId, tasks, taskService.create.mutate)

  return (
    <div className="flex flex-col h-full font-sans gap-6">
      <div className="flex justify-center items-center">
        <h1 className="text-5xl font-bold grow">Tasks</h1>
        <CopyPlus size={48} className="ml-4 cursor-pointer" onClick={onCreate} />
      </div>
      {/* Task list */}
      {
        tasks.map((task) =>  
          <TaskFormProvider key={`provider-${task.id}`} defaultValues={task}>
            <Task key={task.id} taskService={taskService}/>
          </TaskFormProvider>
        )
      }
    </div>
  );
}
