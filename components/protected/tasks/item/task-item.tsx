import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface FormProps {
  register: UseFormRegisterReturn
  errors: FieldErrors<TaskItemModel> | undefined
}

interface TaskItemProps {
    data: TaskItemModel
    formProps: FormProps
    onDelete: (id?: string) => void
}

export default function TaskItem(p: TaskItemProps) {
  return (
    <div className="flex flex-col bg-white p-2">
      <div key={p.data.id} className="flex items-center gap-2">
        <CircleCheck size={30} className="mr-2 cursor-pointer" />
        <AutosizeTextarea placeholder="Enter content" register={p.formProps.register} />
        <Trash2 size={30} className=" cursor-pointer" onClick={() => p.onDelete(p.data.id)} />
      </div>
      {
        p.formProps.errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{p.formProps.errors.content.message}</p>
      }
    </div>
  );
}
