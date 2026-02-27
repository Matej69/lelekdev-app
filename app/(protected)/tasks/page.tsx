'use client';

import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { generateTrackingId } from "@/components/common/utils";
import { TaskModel } from "@/components/protected/tasks/model";
import Task, { taskColors } from "@/components/protected/tasks/task";
import { TaskFormProvider } from "@/components/protected/tasks/TaskFormProvider";
import { useUserContext } from "@/components/protected/user/userContext/UserContext";
import { CopyPlus } from "lucide-react";
import { useEffect } from "react";


export default function TasksPage() {
  //const taskData = mockTasks
  const { id: userId } = useUserContext()
  const taskService = useTasksApi(userId)
  
  if (taskService.get.isLoading)
    return <div>Loading tasks...</div>;
  
  const tasks = taskService.get.data || [];

  const onCreate = () => {
    const newTask: TaskModel = {
      id: generateTrackingId(),
      ownerId: userId,
      title: "[NEW]",
      color: taskColors.beige,
      sortOrder: tasks.length + 1,
      items: [],
    }
    taskService.create.mutate(newTask)
  }

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
