import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldErrors, useFormContext, UseFormRegisterReturn } from "react-hook-form";
import { TaskModel } from "../model";

interface TaskItemProps {
  index: number,
  data: TaskItemModel,
  onDelete: () => void,
  onComplete: () => void
}

export default function TaskItem(p: TaskItemProps) {
  const form = useFormContext<TaskModel>()
  const errors = form.formState.errors.items?.[p.index]

  const completeColor = p.data.completed ? 'MediumSeaGreen' : '#ccc'

  return (
    <div className="flex flex-col bg-white p-2">
      <p>{p.data.id}</p>
      <div className="flex items-center gap-2">
        <CircleCheck color={completeColor} size={30} className="mr-2 cursor-pointer" onClick={p.onComplete}/>
        <AutosizeTextarea placeholder="Enter content" register={form.register(`items.${p.index}.content`)}  />
        <Trash2 size={30} className=" cursor-pointer" onClick={p.onDelete} />
      </div>
      {
        errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{errors.content.message}</p>
      }
    </div>
  );
}
