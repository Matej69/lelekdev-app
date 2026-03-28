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
    const nextFreeSortOrder = tasks.length == 0 ? 1 : Math.max(...tasks.map(t => t.sortOrder)) + 1
    const newTask: TaskModel = {
      id: generateTrackingId(),
      ownerId: userId,
      title: "[NEW]",
      color: taskColors.beige,
      sortOrder: nextFreeSortOrder,
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

    /**
     * Not only logical action but is also adapted to visual task moving, therefore it requires DragDrop library specific result stuff 
     * TODO: Refactor when we start using one form that holds all tasks, not form per task
     */
    const moveTaskItem = (result: DropResult<string>): void => {
      if(!result.destination) return;
      if(result.source.droppableId !== result.destination.droppableId) return; // Makes sure that, for now, you can only move items inside same task - since we have diff. form for each task
      const droppedOnSamePlace =
      result.source.droppableId == result.destination.droppableId && 
      result.source.index == result.destination?.index 
      if(droppedOnSamePlace) return;
      const newItems = [...form.getValues().items]
      const itemToMove = newItems[result.source.index]
      newItems.splice(result.source.index, 1) // Removes from source index
      newItems.splice(result.destination.index, 0, itemToMove) // Adds to destination index
      const normalizedItems = normalizeTaskItemsSortOrder(newItems) // Reassigns task order to be same as index
      form.setValue('items', normalizedItems, {shouldDirty: true})
    }

    return {
      form,
      createTask,
      deleteTask,
      updateTask,
      createTaskItem,
      deleteTaskItem,
      completeTaskItem,
      changeColorTaskItem,
      moveTaskItem
    }
}