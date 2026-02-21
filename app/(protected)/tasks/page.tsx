'use client';

import { useTasks } from "@/api/protected/tasks/useTasks";
import { generateTrackingId } from "@/components/common/utils";
import { TaskModel, TaskSchema } from "@/components/protected/tasks/model";
import Task from "@/components/protected/tasks/task";
import { mockTasks } from "@/mock/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus } from "lucide-react";
import { useForm } from "react-hook-form";


export default function TasksPage() {
  //const taskData = mockTasks
  const taskService = useTasks("2db3ebfb-83a9-4833-bb2d-1352f90f11cf")
  
  if (taskService.get.isLoading)
    return <div>Loading tasks...</div>;

  const tasks = taskService.get.data || [];

  const onCreate = () => {
    const newTask: TaskModel = {
      id: generateTrackingId(),
      ownerId: "2db3ebfb-83a9-4833-bb2d-1352f90f11cf",
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
        tasks.map((task) => (
          <Task key={task.id} data={task} taskService={taskService}
            //onDelete={() => taskService.deleteTask.mutate(task.id)} 
            //onSave={() => taskService.update.mutate(task) } 
            //onTaskItemAdd={() => {}} 
            //onTaskItemDelete={(id) => {}}
          />
        ))
      }
    </div>
  );
}
