import { useFormContext } from "react-hook-form"
import Task from "./task"
import { TaskFormProvider } from "./TaskFormProvider"
import { TaskModel } from "./model"
import { safeCreatePortal } from "@/components/common/utils"
import { CopyPlus } from "lucide-react"
import { useTasks } from "./useTasks"
import { DragDropDroppable } from "@/components/common/drag-drop/DragDropDroppable"
import { DragDropDraggable } from "@/components/common/drag-drop/DragDropDraggable"
import { ReactPortal, useContext, useEffect, useState } from "react"
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider"

export const TasksArray = () => {
    const form = useFormContext<{ tasks: TaskModel[] }>()
    const tasks = form.watch("tasks")
    const taskActions = useTasks()

    const draggableItemIds = tasks?.map(t => ({ id: `task-draggable-${t.id}` })) || []

    const dragDropContext = useContext(DragDropHandlerContext)
    const [addTaskPortal, setAddTaskPortal] = useState<ReactPortal | null>(null) 

    useEffect(() => {
      dragDropContext.registerHandler(`task`, taskActions.moveTask)
      const portal = safeCreatePortal(
          <CopyPlus size={48} className="ml-4 border border-gray-300 rounded cursor-pointer p-2 bg-white" onClick={taskActions.createTask} />, 
          'add-task-placeholder'
      ) 
      setAddTaskPortal(portal)
    }, [])


    return <>
        <TaskFormProvider form={form}>
            { addTaskPortal }
            <DragDropDroppable 
                id={`task-container`} type={`task-container`} acceptTypes={["task"]} items={draggableItemIds} item={{}}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '4rem' }}>
                {
                  tasks.map((task, i) => { return (
                      <DragDropDraggable id={`task-draggable-${task.id}`} index={i} key={`${task.id}`} type="task" acceptTypes={["task"]} containerId={`task-container`} item={task}>
                        <Task key={task.id} index={i}/>
                      </DragDropDraggable>
                  )})
                }
            </DragDropDroppable>
        </TaskFormProvider>
    </>
}