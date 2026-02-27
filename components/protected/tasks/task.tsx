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
import { normalizeTaskItemsSortOrder } from "./utils";

export const taskColors = {
  blue: '#BCF2FF',
  teal: '#B3FFF0',
  mint: '#C3FFD9',
  green: '#BCFFE7',
  lime: '#E6FFB3',
  yellow: '#EDFFBC',
  beige: '#FFF1C3',
  orange: '#FFD8B3',
  peach: '#FFE3BC',
  coral: '#FFC2B3',
  red: '#FFB3B3',
  pink: '#FAD5FF',
  lavender: '#E8D3FF',
  purple: '#E3C8FF',
};


interface TaskProps {
    taskService: ReturnType<typeof useTasksApi>
}

export default function Task(p: TaskProps) {
  const form = useFormContext<TaskModel>()
  const taskColor = form.watch('color')
  const items = form.watch('items');
  const formItems = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const onDelete = () => p.taskService.deleteTask.mutate(form.getValues().id);
  const onSave = () => {
    if(form.formState.isDirty)
      form.handleSubmit((data) => p.taskService.update.mutate(data))()
  };
  const onTaskItemAdd = () => { 
    const newItem: TaskItemModel = {
      id: generateTrackingId(),
      content: "",
      completed: false,
      sortOrder: form.getValues().items.length + 1
    }
    formItems.append(newItem);
  };

  const onItemDelete = (index: number) => {
    let items = form.getValues().items
    items = items.filter((el, i) => i != index)
    items = normalizeTaskItemsSortOrder(items)
    form.setValue('items', items, { shouldDirty: true })
  }

  const onComplete = (index: number) => {
    const old = items[index]
    formItems.update(index, { ...old, completed: !old.completed });
  }

  const onColorChange = (color: string) => {
    form.setValue("color", color, { shouldDirty: true })
  }

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
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={onColorChange}/>
            </Popover>
              <CopyPlus className="cursor-pointer" onClick={onTaskItemAdd} />
              <Save className="cursor-pointer" onClick={onSave} color={form.formState.isDirty ? "black" : "gray"}/>
              <Trash2 className="cursor-pointer" onClick={onDelete} />
          </div>
        </div>
        {/* Task items */}        
        {
          items.map((item, i) => {
            return <TaskItem
              key={item.id}
              data={item}
              index={i}
              onDelete={() => onItemDelete(i)}
              onComplete={() => onComplete(i)}
            />
          })
        }
      </div>
    );
}
