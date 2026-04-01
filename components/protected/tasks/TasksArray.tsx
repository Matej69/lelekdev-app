import { useFormContext } from "react-hook-form"
import Task from "./task"
import { TaskFormProvider } from "./TaskFormProvider"
import { TaskModel } from "./model"
import { safeCreatePortal } from "@/components/common/utils"
import { CopyPlus } from "lucide-react"
import { useTasks } from "./useTasks"

export const TasksArray = () => {
    const form = useFormContext<{ tasks: TaskModel[] }>()

    const tasks = form.watch("tasks")

    const taskActions = useTasks()

    const AddTaskPortaled = () => {
        return safeCreatePortal(
          <CopyPlus size={48} className="ml-4 border border-gray-300 rounded cursor-pointer p-2 bg-white" onClick={taskActions.createTask} />, 
          'add-task-placeholder'
        )
  }

    return <>
        <TaskFormProvider form={form}>
        { AddTaskPortaled() }
        {
            tasks.map((task, i) =>  
                <Task key={task.id} index={i}/>
            )
        }
        </TaskFormProvider>
    </>
}