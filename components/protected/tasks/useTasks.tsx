import { useTasksApi } from "@/api/protected/tasks/useTasksApi"
import { useUserContext } from "../user/userContext/UserContext"
import { TaskModel } from "./model"
import { forceFormDirtiness, generateTrackingId, moveAcrossCollections, moveInCollection } from "@/components/common/utils"
import { useFieldArray, useFormContext } from "react-hook-form"
import { TaskItemModel } from "./item/model"
import { normalizeTaskItemsSortOrder, normalizeTaskSortOrder } from "./utils"
import { taskColors } from "./constants"
import { DragEvent } from "@/components/common/drag-drop/DragEvent"

// Has to be outside of useTask hook since it is called outside of TaskFormProvider

export const useTasks = () => {
    const { id: userId } = useUserContext()
    const tasksApi = useTasksApi(userId)
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
      tasksApi.create.mutate(newTask, {
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
      form.setValue('tasks', newTasks)
      tasksApi.deleteTask.mutate(taskToDelete.id);
  };

    const updateTask = async (taskIndex: number) => {
      const taskToUpdate = form.getValues(`tasks.${taskIndex}`)
      const isFormValid = await form.trigger(`tasks.${taskIndex}`);
      if (!isFormValid) return;
      const res = await tasksApi.update.mutateAsync(taskToUpdate)
      if(!res) return;
      form.resetField(`tasks.${taskIndex}`, {
        keepDirty: false,
        defaultValue: form.getValues(`tasks.${taskIndex}`),
      });
    };

    const moveTask = (dragEvent: DragEvent): void => {
      const { dragged, target, draggedOn } = dragEvent
      const isDraggingTask = dragged.type == 'task'
      const isDraggingToTask = target.type == 'task'
      if(!isDraggingTask || !isDraggingToTask || !draggedOn.sameContainer)
        return;
      if(target.index == null)
        return;
      const tasks = form?.getValues(`tasks`)
      let newTasks = moveInCollection(tasks, dragged.index, target.index)
      form.setValue(`tasks`, newTasks)
      tasksApi.update.mutate(newTasks[target.index])
    }

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
    };

    const deleteTaskItem = (taskIndex: number, taskItemIndex: number) => {
      let items = [...form.getValues(`tasks.${taskIndex}.items`)]
      items = items.filter((el, i) => i != taskItemIndex)
      items = normalizeTaskItemsSortOrder(items)
      form.setValue(`tasks.${taskIndex}.items`, items, { shouldDirty: true })
      forceFormDirtiness(form, `tasks.${taskIndex}.items`)
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

    /**
     * 
     * @param dragEvent 
     */
    const moveTaskItem = (dragEvent: DragEvent): void => {
      const { dragged, target, activeSnapshot, draggedOn, action } = dragEvent
      const types = {
        item: 'task-item',
        container: 'task-item-container'
      }
      const isDraggingTaskItem = dragged.type == types.item
      const isDraggingToItemOrContainer = [types.item, types.container].includes(target.type)
      if(!isDraggingTaskItem || !isDraggingToItemOrContainer)
        return;
      const tasks = [...form.getValues('tasks')]
      // Dragged to different container
      if(action == 'drag-over' && !draggedOn.sameContainer && !draggedOn.sameItem) {
        const targetTaskId = draggedOn.container ? target.id : target.groupId
        const targetTask = tasks.find(r => r.id == targetTaskId)
        const draggedTask = tasks.find(r => r.id == dragged.groupId)
        const targetContainerEmpty = targetTask?.items?.length == 0
        const indexToMoveItemTo = targetContainerEmpty ? 0 : target.index
        if(draggedTask?.items && targetTask?.items && draggedTask.items.length > dragged.index && indexToMoveItemTo != null) {
          moveAcrossCollections(
            draggedTask.items, dragged.index,
            targetTask.items, indexToMoveItemTo,
            (itemToMove) => newShallowCopyItemFromExisting(itemToMove)
          )
          form.setValue('tasks', tasks)
        }
      }
      else if(action == 'drag-end') {
        // Dragged in same container
        if(draggedOn.sameContainer && !draggedOn.sameItem) {
          const taskIndex = tasks.findIndex(r => target.groupId == r.id)
          const task = {...tasks[taskIndex]}
          if(target.index != null) {
            task.items = moveInCollection(task.items || [], dragged.index, target.index)
            const shouldDirty = dragged.groupId === activeSnapshot.groupId
            form.setValue(`tasks.${taskIndex}.items`, task.items, { shouldDirty })
          }
        }
        // Dragged to different container - commit changes - automatically save since its weird to manually save both containers when item moves
        const differentContainerFromSnapshot = dragged.groupId !== activeSnapshot.groupId 
        if(differentContainerFromSnapshot) {
          const originTask = tasks.find(r => r.id == dragEvent.activeSnapshot.groupId)
          const targetTaskId = target.type == types.item ? target.groupId : target.id 
          const targetTask = tasks.find(r => r.id == targetTaskId)
          if(originTask && targetTask) {
            const originTaskIndex = tasks.findIndex(r => r.id === originTask.id) 
            updateTask(originTaskIndex)
            const targetTaskIndex = tasks.findIndex(r => r.id === targetTask.id) 
            updateTask(targetTaskIndex)
          }
        }
      }
    }

    return {
      form,
      createTask,
      deleteTask,
      updateTask,
      moveTask,
      createTaskItem,
      deleteTaskItem,
      completeTaskItem,
      changeColorTaskItem,
      moveTaskItem
    }
}