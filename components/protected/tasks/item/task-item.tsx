import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Path, useFormContext } from "react-hook-form";
import { TaskModel } from "../model";
import { useTasks } from "../useTasks";
import { completionTaskItemMarkColor } from "./constants";

interface TaskItemProps {
  index: number,
  taskIndex: number,
  data: TaskItemModel
}

export default function TaskItem(p: TaskItemProps) {
  const form = useFormContext<{ tasks: TaskModel[] }>()
  const errors = form.formState.errors.tasks?.[p.taskIndex]?.items?.[p.index]
  const taskActions = useTasks()

  const completionColor = p.data.completed ? completionTaskItemMarkColor.completed : completionTaskItemMarkColor.notCompleted
  const onCompleteTaskItem = () => taskActions.completeTaskItem(p.taskIndex, p.index)
  const onDeleteTaskItem = () => taskActions.deleteTaskItem(p.taskIndex, p.index)

  // Used as listener data for quick creation of new task item
  const dataAttributes = {
    'data-type': 'task-item',
    'data-data': JSON.stringify({ taskIndex: p.taskIndex, taskItemIndex: p.index  })
  } 

  return (
    <div className="flex flex-col bg-white p-2" {...dataAttributes}>
      <div className="flex items-center gap-2">
        <CircleCheck color={completionColor} size={30} className="mr-2 cursor-pointer" onClick={onCompleteTaskItem}/>
        <AutosizeTextarea placeholder="Enter content" register={form.register(`tasks.${p.taskIndex}.items.${p.index}.content`)} />
        <Trash2 size={30} className=" cursor-pointer" onClick={onDeleteTaskItem} />
      </div>
      {
        errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{errors.content.message}</p>
      }
    </div>
  );
}
