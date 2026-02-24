import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface TaskItemProps {
    data: TaskItemModel
    register: UseFormRegisterReturn
    errors: FieldErrors<TaskItemModel> | undefined
    onDelete: () => void
    onCompleted: () => void
}

export default function TaskItem(p: TaskItemProps) {
  return (
    <div className="flex flex-col bg-white p-2">
      <div key={p.data.id} className="flex items-center gap-2">
        <CircleCheck size={30} className="mr-2 cursor-pointer" onClick={() => p.onCompleted()}/>
        <AutosizeTextarea placeholder="Enter content" register={p.register}  />
        <Trash2 size={30} className=" cursor-pointer" onClick={() => p.onDelete()} />
      </div>
      {
        p.errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{p.errors.content.message}</p>
      }
    </div>
  );
}
