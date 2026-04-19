import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { TaskItemModel } from "./model";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Path, useFormContext } from "react-hook-form";
import { TaskModel } from "../model";
import { useTasks } from "../useTasks";
import { completionTaskItemMarkColor } from "./constants";
import { createDataAttributes } from "@/components/common/shortcuts-registration/shortcuts-registration";
import { IconButton } from "@/components/common/IconButton";

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

  const dataAttributes = createDataAttributes('task-item', { taskIndex: p.taskIndex, taskItemIndex: p.index })

  const checkmarkAriaLabel = p.data.completed ? "Mark as not completed" : "Mark as completed"

  return (
    <div className="flex flex-col bg-white p-2" {...dataAttributes}>
      <div className="flex items-center gap-2">
        <IconButton icon='checkmark' onClick={onCompleteTaskItem} aria-label={checkmarkAriaLabel} iconProps={{ color: completionColor, size: 28 }} />
        <AutosizeTextarea placeholder="Enter task content" register={form.register(`tasks.${p.taskIndex}.items.${p.index}.content`)} />
        <IconButton icon='delete' onClick={onDeleteTaskItem} aria-label="Delete task item" />
      </div>
      {
        errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{errors.content.message}</p>
      }
    </div>
  );
}
