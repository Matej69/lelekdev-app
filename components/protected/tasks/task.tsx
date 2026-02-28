'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { useState } from "react";
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


interface TaskProps {
    taskService: ReturnType<typeof useTasksApi>
}

export default function Task(p: TaskProps) {
  const taskActions = useTasks()
  const form = useFormContext<TaskModel>()
  const taskColor = form.watch('color')
  const items = form.watch('items');

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
        {
          items.map((item, i) => {
            return <TaskItem
              key={item.id}
              data={item}
              index={i}
            />
          })
        }
      </div>
    );
}
