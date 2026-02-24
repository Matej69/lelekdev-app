'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { useState } from "react";
import { TaskModel, TaskSchema } from "./model";
import { TaskItemModel } from "./item/model";
import TaskItem from "./item/task-item";
import { FieldErrors, Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { get } from "http";
import { generateTrackingId } from "@/components/common/utils";

const taskColors = {
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
    data: TaskModel
    taskService: ReturnType<typeof useTasksApi>
}

export default function Task(p: TaskProps) {

  const { register, handleSubmit, formState: { errors, isDirty }, getValues, setValue, control } = useForm<TaskModel>({
    resolver: zodResolver(TaskSchema) as Resolver<TaskModel>,
    defaultValues: p.data
  });
  const { fields, update, remove, append } = useFieldArray({
    control,
    name: "items",
  });
  
  const onDelete = () => p.taskService.deleteTask.mutate(p.data.id);
  const onSave = () => {
    if(isDirty)
      handleSubmit((data) => p.taskService.update.mutate(data))()
  };
  const onTaskItemAdd = () => {
    const newItem: TaskItemModel = {
      id: generateTrackingId(),
      content: "",
      completed: false,
    }
      setValue("items", [...getValues().items, newItem])
  };
  const onCompleted = (index: number) => {
    update(2, { ...fields[2], completed: true });
  }

    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 shadow-[4px_4px_0_black]">
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: taskColors.blue }}>
          {/* Title */}
          <div className="flex grow">
             <Dot /> 
              <p className="font-bold">{p.data.id || ""}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
              <CopyPlus className="cursor-pointer" onClick={onTaskItemAdd} />
              <Save className="cursor-pointer" onClick={onSave} color={isDirty ? "black" : "skyblue"}/>
              <Trash2 className="cursor-pointer" onClick={onDelete} />
          </div>
        </div>
        {/* Task items */}
        {
          fields.map((item, i) => {
            return <TaskItem
              key={item.id}
              data={item}
              register={register(`items.${i}.content`)} 
              errors={errors.items?.[i]}
              onDelete={() => remove(i)}
              onCompleted={() => onCompleted(i)}
              />
          })
        }
      </div>
    );
}
