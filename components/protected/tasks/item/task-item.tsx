import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { useFormContext } from "react-hook-form";
import { TaskModel } from "../model";
import { useTasks } from "../useTasks";
import { completionTaskItemMarkColor } from "./constants";

interface TaskItemProps {
  index: number,
  data: TaskItemModel
}

export default function TaskItem(p: TaskItemProps) {
  const form = useFormContext<TaskModel>()
  const errors = form.formState.errors.items?.[p.index]
  const taskActions = useTasks()

  const completionColor = p.data.completed ? completionTaskItemMarkColor.completed : completionTaskItemMarkColor.notCompleted

  return (
    <div className="flex flex-col bg-white p-2">
      <div className="flex items-center gap-2">
        <CircleCheck color={completionColor} size={30} className="mr-2 cursor-pointer" onClick={() => taskActions.completeTaskItem(p.index)}/>
        <AutosizeTextarea placeholder="Enter content" register={form.register(`items.${p.index}.content`)} />
        <Trash2 size={30} className=" cursor-pointer" onClick={() => taskActions.deleteTaskItem(p.index)} />
      </div>
      {
        errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{errors.content.message}</p>
      }
    </div>
  );
}
