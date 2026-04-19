import { useFormContext } from "react-hook-form"
import Task from "./task"
import { TaskFormProvider } from "./TaskFormProvider"
import { TaskModel } from "./model"
import { CopyPlus } from "lucide-react"
import { useTasks } from "./useTasks"
import { DragDropDroppable, DragDropDroppableProps } from "@/components/common/drag-drop/DragDropDroppable"
import { DragDropDraggable, DragDropDraggableProps } from "@/components/common/drag-drop/DragDropDraggable"
import { ReactPortal, useContext, useEffect, useState } from "react"
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider"
import { registerShortcutListener, unregisterShortcutListener } from "@/components/common/shortcuts-registration/shortcuts-registration"
import { safeCreatePortal } from "@/components/common/utils"
import { IconButton } from "@/components/common/IconButton"

export const TasksArray = () => {
    const form = useFormContext<{ tasks: TaskModel[] }>()
    const tasks = form.watch("tasks")
    const taskActions = useTasks()

    const draggableItemIds = tasks?.map(t => ({ id: `task-draggable-${t.id}` })) || []

    const dragDropContext = useContext(DragDropHandlerContext)
    const [addTaskPortal, setAddTaskPortal] = useState<ReactPortal | null>(null) 

    useEffect(() => {
        dragDropContext.registerHandler(`task`, taskActions.moveTask)
        const createShortcutListener = registerShortcutListener('task-item', 'create', (data) => {taskActions.createTaskItemAtIndex(data.taskIndex, data.taskItemIndex)})
        const deleteShortcutListener = registerShortcutListener('task-item', 'delete', (data) => {taskActions.deleteTaskItem(data.taskIndex, data.taskItemIndex)})
        const saveShortcutListener = registerShortcutListener('task-item', 'save', (data) => {taskActions.updateTask(data.taskIndex)})
        const duplicateShortcutListener = registerShortcutListener('task-item', 'duplicate', (data) => {taskActions.duplicateTaskItemAtIndex(data.taskIndex, data.taskItemIndex)})
        const moveUpShortcutListener = registerShortcutListener('task-item', 'moveUp', (data) => {taskActions.moveTaskItemUp(data.taskIndex, data.taskItemIndex)})
        const moveDownShortcutListener = registerShortcutListener('task-item', 'moveDown', (data) => {taskActions.moveTaskItemDown(data.taskIndex, data.taskItemIndex)})
        const portal = safeCreatePortal(
            <IconButton icon='add' onClick={taskActions.createTask} aria-label="Add task" iconProps={{ size: 50 }} iconClassName="ml-4 border border-gray-300 rounded cursor-pointer p-2 bg-white"/>, 
            'add-task-placeholder'
        ) 
        setAddTaskPortal(portal)

        return () => {
            unregisterShortcutListener(createShortcutListener);
            unregisterShortcutListener(deleteShortcutListener);
            unregisterShortcutListener(saveShortcutListener);
            unregisterShortcutListener(moveUpShortcutListener);
            unregisterShortcutListener(moveDownShortcutListener);
            unregisterShortcutListener(duplicateShortcutListener);
        }
    }, [])

    const droppableProps: Omit<DragDropDroppableProps, 'children'> = {
        id: `task-container`,
        type: `task-container`,
        acceptTypes: ["task"],
        items: draggableItemIds,
        item: {},
    };

    const draggableProps = (task: { id: string }, index: number): Omit<DragDropDraggableProps, 'children'> => ({
      id: `task-draggable-${task.id}`,
      index: index,
      type: "task",
      acceptTypes: ["task"],
      containerId: `task-container`,
      item: task,
    });


    return <>
        <TaskFormProvider form={form}>
            { addTaskPortal }
            <DragDropDroppable {...droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '4rem' }}>
                {
                  tasks.map((task, i) => { return (
                      <DragDropDraggable key={`${task.id}-${i}`} {...draggableProps(task, i)}>
                        <Task index={i}/>
                      </DragDropDraggable>
                  )})
                }
            </DragDropDroppable>
        </TaskFormProvider>
    </>
}