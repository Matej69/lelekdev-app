import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "./model"
import { forceFormDirtiness, generateTrackingId, idFromDragDropId, moveAcrossCollections, moveInCollection } from "@/components/common/utils"
import { useFieldArray, useFormContext } from "react-hook-form"
import { TaskItemModel } from "./item/model"
import { normalizeTaskItemsSortOrder, normalizeTaskSortOrder } from "./utils"
import { taskColors } from "./constants"
import { DragEvent } from "@/components/common/drag-drop/DragEvent"

// Has to be outside of useTask hook since it is called outside of TaskFormProvider

export const useTasks = () => {
    const { id: userId } = useUserContext()
    const taskService = useTasksApi(userId)
    const form = useFormContext<{ tasks: TaskModel[] }>()

    const createTask = () => {
      const newTask: TaskModel = {
        id: generateTrackingId(),
        ownerId: userId,
        title: "[NEW]",
        isNew: true,
        color: taskColors.beige,
        sortOrder: 1,
        items: [],
      }
      taskService.create.mutate(newTask, {
        onSuccess: (taskReceived) => {
          const tasks = [taskReceived, ...form.getValues('tasks')]
          tasks.forEach((task, i) => { if(i > 0) task.sortOrder += 1})
          form.setValue('tasks', tasks)
        }
      });
    }

    const deleteTask = (taskIndex: number) => {
      let tasks = [...form.getValues('tasks')]
      const taskToDelete = tasks[taskIndex]
      let newTasks = tasks.filter(task => task.id !== taskToDelete.id)
      newTasks = normalizeTaskSortOrder(newTasks)
      form.setValue('tasks', newTasks, { shouldDirty: true })
      taskService.deleteTask.mutate(taskToDelete.id);
  };

    const updateTask = async (taskIndex: number) => {
        const taskToUpdate = form.getValues(`tasks.${taskIndex}`)
        console.log("Updating task: ", taskToUpdate)
        const isFormValid = await form.trigger(`tasks.${taskIndex}`);
        console.log("isFormValid: ", form.formState.errors)
        if (!isFormValid) return;
        const res = await taskService.update.mutateAsync(taskToUpdate)
        console.log("Update response: ", res)
        if(!res) return;
        form.resetField(`tasks.${taskIndex}`, {
          keepDirty: false,
          defaultValue: form.getValues(`tasks.${taskIndex}`),
        });
      };

    const createTaskItem = (taskIndex: number) => { 
        const newItem: TaskItemModel = {
          id: generateTrackingId(),
          isNew: true,
          content: "",
          completed: false,
          sortOrder: form.getValues(`tasks.${taskIndex}.items`).length + 1
        }
        const items = [...form.getValues(`tasks.${taskIndex}.items`), newItem]
        form.setValue(`tasks.${taskIndex}.items`, items, { shouldDirty: true })
        //itemFieldArrays[taskIndex].append(newItem);
    };

    const deleteTaskItem = (taskIndex: number, taskItemIndex: number) => {
      let items = [...form.getValues(`tasks.${taskIndex}.items`)]
      items = items.filter((el, i) => i != taskItemIndex)
      items = normalizeTaskItemsSortOrder(items)
      form.setValue(`tasks.${taskIndex}.items`, items, { shouldDirty: true })
      forceFormDirtiness(form, `recipes.${taskIndex}.sections`)
    }

    const completeTaskItem = (taskIndex: number, taskItemIndex: number) => {
      const wasCompleted = form.getValues(`tasks.${taskIndex}.items.${taskItemIndex}.completed`)
      form.setValue(`tasks.${taskIndex}.items.${taskItemIndex}.completed`, !wasCompleted, { shouldDirty: true })
    }

    const changeColorTaskItem = (taskIndex: number, color: string) => {
      form.setValue(`tasks.${taskIndex}.color`, color, { shouldDirty: true })
    }

    const newShallowCopyItemFromExisting = (item: TaskItemModel) => {
      return {
            ...item,
            isNew: true,
          } as TaskItemModel
    }

    const moveTaskItem = (dragEvent: DragEvent): void => {
      const { active, over } = dragEvent
      const [activeId, overId] = [idFromDragDropId(active.id), idFromDragDropId(over.id || '')]
      const [activeGroupId, overGroupId] = [idFromDragDropId(active.groupId), idFromDragDropId(over.groupId || '')]
      const isDraggingRecipeTask = active.type === 'task-item'
      const overEmptyContainer = form.getValues(`tasks`).find(r => r.id == overId)?.items?.length == 0
      const dragState = {
        sameContainer: activeGroupId === overGroupId ? 'SAME' : 'DIFFERENT',
        draggedTo: active.type !== over.type && overEmptyContainer ? 'EMPTY_CONTAINER' : 'NON_EMPTY_CONTAINER'
      } as const
      // Dragged to another position in same task
      if(dragState.sameContainer === 'SAME' && dragState.draggedTo === 'NON_EMPTY_CONTAINER') {
        const taskIndex = form.getValues(`tasks`).findIndex(r => overGroupId == idFromDragDropId(r.id))
        const task = {...form.getValues(`tasks.${taskIndex}`)}
        if(over.index != null) {
          task.items = moveInCollection(task.items || [], active.index, over.index)
          form.setValue(`tasks.${taskIndex}.items`, task.items, { shouldDirty: true })
        }
      }
      // Sort goes to negative for osme reason and cant be saved, 
      if(dragState.sameContainer === 'DIFFERENT' && dragState.draggedTo === 'NON_EMPTY_CONTAINER') {
        const tasks = [...form.getValues('tasks')]
        const activeTask = tasks.find(r => r.id == activeGroupId)
        const overTask = tasks.find(r => r.id == overGroupId)
        if(activeTask?.items && overTask?.items && activeTask.items.length > active.index && overGroupId && over.index != null) {
          moveAcrossCollections(
            activeTask.items, active.index,
            overTask.items, over.index,
            (itemToMove) => newShallowCopyItemFromExisting(itemToMove)
          )
          const activeTaskIndex = tasks.findIndex(r => r.id == activeGroupId)
          forceFormDirtiness(form, `tasks.${activeTaskIndex}`)
          form.setValue('tasks', tasks, {shouldDirty: true})
        }
      }
      else if(dragState.sameContainer === 'DIFFERENT' && dragState.draggedTo === 'EMPTY_CONTAINER') {
        const tasks = [...form.getValues('tasks')]
        const activeTask = tasks.find(r => r.id == activeGroupId)
        const overTask = tasks.find(r => r.id == overId)
        if(activeTask?.items && overTask?.items && activeTask.items.length > active.index) {
          moveAcrossCollections(
            activeTask.items, active.index,
            overTask.items, 0,
            (itemToMove) => newShallowCopyItemFromExisting(itemToMove)
          )
          const activeTaskIndex = tasks.findIndex(r => r.id == activeGroupId)
          forceFormDirtiness(form, `tasks.${activeTaskIndex}`)
          form.setValue('tasks', tasks, {shouldDirty: true})
        }
      }
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