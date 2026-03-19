'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TaskModel, TaskSchema } from "./model";
import { TaskItemModel } from "./item/model";
import TaskItem from "./item/task-item";
import { FieldErrors, Resolver, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { get } from "http";
import { generateTrackingId } from "@/components/common/utils";
import { Popover } from "@/components/common/Popover";
import { ColorPicker } from "@/components/common/ColorPicker";
import { useTasks } from "./useTasks";
import { taskColors } from "./constants";
import { DragDropContext } from "@hello-pangea/dnd";
import { DragDropDroppable } from "../../common/drag-drop/DragDropDroppable";
import { DragDropDraggable } from "../../common/drag-drop/DragDropDraggable";
import { DragDropHandlerContext } from "@/app/DragDropProvider";


interface TaskProps {
    taskService: ReturnType<typeof useTasksApi>
}

export default function Task(p: TaskProps) {
  const taskActions = useTasks()
  const form = useFormContext<TaskModel>()
  const taskColor = form.watch('color')
  const items = form.watch('items');

  // TODO: THIS SHOULDN'T BE DONE HERE PER TASK BUT ONE LEVEL HIGHER(PER APP)
  // WELL ONE LEVEL HIGHER IS NOT WRAPPED IN FORM WHICH IS USED IN 'useTasks' SO YEA....
  // FIX THIS BY NOT TaskFormProvider inside TaskArray component - one extra comp. solves this hell
  // For now it will register handler for each task with 'moveTaskItem' that will use proper form per task
  const dragDropContext = useContext(DragDropHandlerContext)
  useEffect(() => {
    dragDropContext.registerHandler(`task-item-${form.getValues().id}`, taskActions.moveTaskItem)
  }, [])


    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 shadow-[4px_4px_0_black]">
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: taskColor }}>
          {/* Title */}
          <div className="flex grow">
             <Dot /> 
             <div>
              <input {...form.register('title')}></input>
              { form.formState.errors?.title?.message &&  <p className="text-red-500 pl-1">{form.formState.errors?.title?.message}</p>}
             </div>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
            <Popover trigger={<Paintbrush className="cursor-pointer"/>}>
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={taskActions.changeColorTaskItem}/>
            </Popover>
              <CopyPlus className="cursor-pointer" onClick={taskActions.createTaskItem} />
              <Save className="cursor-pointer" onClick={taskActions.updateTask} color={form.formState.isDirty ? "black" : "gray"}/>
              <Trash2 className="cursor-pointer" onClick={taskActions.deleteTask} />
          </div>
        </div>
        {/* Task items */}
        {/* When we merge allf orms for tasks to single form, then type='task-item', right now each task list is independent droppable area */}    
        <DragDropDroppable droppableId={`${form.getValues().id}`} type={`task-item-${form.getValues().id}`}>
        {
          items.map((item, i) => { return (
              <DragDropDraggable index={i} draggableId={item.id} key={`${item.id}`}>
                <TaskItem key={item.id} data={item} index={i}/>
              </DragDropDraggable>
          )})
        }
        </DragDropDroppable>
      </div>
    );
}
