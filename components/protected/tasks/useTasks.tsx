import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "./model"
import { generateTrackingId } from "@/components/common/utils"
import { useFieldArray, useFormContext } from "react-hook-form"
import { TaskItemModel } from "./item/model"
import { normalizeTaskItemsSortOrder } from "./utils"
import { taskColors } from "./constants"

// Has to be outside of useTask hook since it is called outside of TaskFormProvider
export const createTask = (userId: string, tasks: TaskModel[], mutateFun: (taskToCreate: TaskModel) => void ) => {
    const newTask: TaskModel = {
      id: generateTrackingId(),
      ownerId: userId,
      title: "[NEW]",
      color: taskColors.beige,
      sortOrder: tasks.length + 1,
      items: [],
    }
    mutateFun(newTask)
  }

export const useTasks = () => {
    const { id: userId } = useUserContext()
    const taskService = useTasksApi(userId)
    const form = useFormContext<TaskModel>()
    const formItems = useFieldArray({
        control: form.control,
        name: "items",
    });
    const items = form.watch('items');
    const taskColor = form.watch('color')

    const deleteTask = () => taskService.deleteTask.mutate(form.getValues().id);

    const updateTask = () => {
        if(form.formState.isDirty)
            form.handleSubmit((data) => taskService.update.mutate(data))()
    };

    const createTaskItem = () => { 
        const newItem: TaskItemModel = {
          id: generateTrackingId(),
          content: "",
          completed: false,
          sortOrder: form.getValues().items.length + 1
        }
        formItems.append(newItem);
    };

    const deleteTaskItem = (index: number) => {
      let items = form.getValues().items
      items = items.filter((el, i) => i != index)
      items = normalizeTaskItemsSortOrder(items)
      form.setValue('items', items, { shouldDirty: true })
    }

    const completeTaskItem = (index: number) => {
      const old = items[index]
      formItems.update(index, { ...old, completed: !old.completed });
    }

    const changeColorTaskItem = (color: string) => {
      form.setValue("color", color, { shouldDirty: true })
    }

    return {
      form,
      createTask,
      deleteTask,
      updateTask,
      createTaskItem,
      deleteTaskItem,
      completeTaskItem,
      changeColorTaskItem
    }
}