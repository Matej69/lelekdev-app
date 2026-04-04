'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { TaskModel, TaskSchema } from "./model";
import { TaskItemModel } from "./item/model";
import TaskItem from "./item/task-item";
import { FieldErrors, Resolver, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { get } from "http";
import { generateTrackingId, safeCreatePortal } from "@/components/common/utils";
import { Popover } from "@/components/common/Popover";
import { ColorPicker } from "@/components/common/ColorPicker";
import { useTasks } from "./useTasks";
import { taskColors } from "./constants";
import { DragDropDroppable, DragDropDroppableProps } from "../../common/drag-drop/DragDropDroppable";
import { DragDropDraggable, DragDropDraggableProps } from "../../common/drag-drop/DragDropDraggable";
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider";
import { createPortal } from "react-dom";
import { useUserContext } from "../user/userContext/UserContext";


interface TaskProps {
  index: number
}

export default function Task(p: TaskProps) {
  const taskActions = useTasks()
  const form = useFormContext<{ tasks: TaskModel[] }>()
  const recipe = form.getValues(`tasks.${p.index}`) 

  const [id, color, items] = useWatch({
    control: form.control,
    name: [
      `tasks.${p.index}.id`,
      `tasks.${p.index}.color`,
      `tasks.${p.index}.items`
    ],
  });
  

  const errors = form.formState.errors.tasks?.[p.index]

  const dragDropContext = useContext(DragDropHandlerContext)
  useEffect(() => {
    dragDropContext.registerHandler(`task-item`, taskActions.moveTaskItem)
  }, [])

  const taskDirtyFields = form.formState.dirtyFields.tasks?.[p.index]
  const isAnyFieldDirty = taskDirtyFields ? Object.keys(taskDirtyFields).length > 0 : false;
  const containerShadowStyle: CSSProperties = { boxShadow: `4px 4px 0 ${isAnyFieldDirty ? "#ccc" : "black"}` }

  const draggableItemIds = items?.map(it => ({ id: `task-item-draggable-${it.id}` })) || []

  const onColorSelect = (color: string) => taskActions.changeColorTaskItem(p.index, color)
  const onTaskDelete = () => taskActions.deleteTask(p.index)
  const onTaskUpdate = () => isAnyFieldDirty && taskActions.updateTask(p.index)
  const onTaskCreateItem = () => taskActions.createTaskItem(p.index)

  const droppableProps: Omit<DragDropDroppableProps, 'children'> = {
    id: `task-item-container-${id}`,
    type:`task-item-container`,
    acceptTypes: ["task-item"] ,
    items: draggableItemIds,
    item: recipe
  }

  const draggableProps = (item: {id: string}, index: number): Omit<DragDropDraggableProps, 'children'> => ({
    id: `task-item-draggable-${item.id}`,
    index: index,
    type: "task-item",
    acceptTypes: ["task-item"],
    containerId: `task-item-container-${id}`,
    item: item,
  });

    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 transition-shadow duration-300" style={containerShadowStyle}>
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: color }}>
          {/* Title */}
          <div className="flex grow">
             <Dot /> 
             <div>
              <p>{form.getValues(`tasks.${p.index}.id`)} - {form.getValues(`tasks.${p.index}.sortOrder`)}</p>
              <input {...form.register(`tasks.${p.index}.title`)}></input>
              { errors?.title?.message &&  <p className="text-red-500 pl-1">{errors?.title?.message}</p>}
             </div>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
            <Popover trigger={<Paintbrush className="cursor-pointer"/>}>
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={onColorSelect}/>
            </Popover>
              <CopyPlus className="cursor-pointer" onClick={onTaskCreateItem} />
              <Save className="cursor-pointer" onClick={onTaskUpdate} color={isAnyFieldDirty ? "black" : "gray"}/>
              <Trash2 className="cursor-pointer" onClick={onTaskDelete} />
          </div>
        </div>
        {/* Task items */}
        <DragDropDroppable {...droppableProps} style={{ minHeight: '4rem' , background: 'white' }}>
        {
          items.map((item, i) => { return (
              <DragDropDraggable key={`${item.id}`} {...draggableProps(item, i)}>
                <TaskItem key={item.id} data={item} index={i} taskIndex={p.index}/>
              </DragDropDraggable>
          )})
        }
        </DragDropDroppable>
      </div>
    );
}
