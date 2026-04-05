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
      const { dragged: active, target: over } = dragEvent
      const isDraggingTask = active.type === 'task'
      const draggingInsideSameContainer = !isDraggingTask || active.groupId !== over.groupId 
      if(draggingInsideSameContainer)
        return;
      const tasks = form?.getValues(`tasks`)
      if(over.index != null) {
        let newRecipes = moveInCollection(tasks, active.index, over.index)
        form.setValue(`tasks`, newRecipes)
        tasksApi.update.mutate(newRecipes[over.index])
      }
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
     * Garbage function
     * Should be separated on moveTaskItemInside and dropTaskItem - movement task item through tasks and droppng task item on task
     * Also means there should be 2 registrations for drag-over and drag-end events - probably 1 objects with 2 
     * 'overEmptyContainer' calculationacan be exposed as lambda and assigned during registration so it can be put into dragEvent and be prepared for move and drop functions
     * @param dragEvent 
     */
    const moveTaskItem = (dragEvent: DragEvent): void => {
      const { dragged, target, activeSnapshot, draggedOn } = dragEvent
      if(dragEvent.action == 'drag-over' && !draggedOn.sameContainer && !draggedOn.sameItem) {
        const containerId = draggedOn.container ? target.id : target.groupId
        const targetContainer = form.getValues(`tasks`).find(r => r.id == containerId)
        const targetContainerEmpty = targetContainer?.items?.length == 0
        // Drag over empty container
        if(targetContainerEmpty) {
          const tasks = [...form.getValues('tasks')]
          const draggedTask = tasks.find(r => r.id == dragged.groupId)
          const targetTask = tasks.find(r => r.id == target.id)
          if(draggedTask?.items && targetTask?.items && draggedTask.items.length > dragged.index) {
            moveAcrossCollections(
              draggedTask.items, dragged.index,
              targetTask.items, 0,
              (itemToMove) => newShallowCopyItemFromExisting(itemToMove)
            )
            form.setValue('tasks', tasks)
          }
        }
        // Drag over non empty container
        if(!targetContainerEmpty) {
          const tasks = [...form.getValues('tasks')]
          const draggedTask = tasks.find(r => r.id == dragged.groupId)
          const targetTask = tasks.find(r => r.id == target.groupId)
          if(draggedTask?.items && targetTask?.items && draggedTask.items.length > dragged.index && target.groupId && target.index != null) {
            moveAcrossCollections(
              draggedTask.items, dragged.index,
              targetTask.items, target.index,
              (itemToMove) => newShallowCopyItemFromExisting(itemToMove)
            )
            form.setValue('tasks', tasks)
          }
        }
      }
      else if(dragEvent.action == 'drag-end') {
        // Dragged to another position in same task
        if(draggedOn.sameContainer && !draggedOn.sameItem /*&& draggedToContainer === 'NON_EMPTY_CONTAINER'*/) {
          const taskIndex = form.getValues(`tasks`).findIndex(r => target.groupId == r.id)
          const task = {...form.getValues(`tasks.${taskIndex}`)}
          if(target.index != null) {
            task.items = moveInCollection(task.items || [], dragged.index, target.index)
            const shouldDirty = dragged.groupId === activeSnapshot.groupId
            form.setValue(`tasks.${taskIndex}.items`, task.items, { shouldDirty })
          }
        }
        // Item moved to different container - automatically save since its weird to manually save both containers when item moves
        const differentContainerFromSnapshot = dragged.groupId !== activeSnapshot.groupId 
        if(differentContainerFromSnapshot) {
          const tasks = form.getValues('tasks')
          const originTask = tasks.find(r => r.id == dragEvent.activeSnapshot.groupId)
          const overTaskId = target.type == 'task-item' ? target.groupId : target.id 
          const overTask = tasks.find(r => r.id == overTaskId)
          if(originTask && overTask) {
            tasksApi.update.mutate(originTask)
            tasksApi.update.mutate(overTask)
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