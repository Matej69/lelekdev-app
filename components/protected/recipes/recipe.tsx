'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { useState } from "react";
import { TaskModel, TaskSchema } from "../tasks/model";
import { TaskItemModel } from "../tasks/item/model";
import TaskItem from "../tasks/item/task-item";
import { FieldErrors, Resolver, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasksApi } from "@/api/protected/tasks/useTasksApi";
import { get } from "http";
import { generateTrackingId } from "@/components/common/utils";
import { Popover } from "@/components/common/Popover";
import { ColorPicker } from "@/components/common/ColorPicker";
import { useTasks } from "../tasks/useTasks";
import { taskColors } from "../tasks/constants";
import { DragDropContext } from "@hello-pangea/dnd";
import { TaskItemDroppable } from "../../common/drag-drop/TaskItemDroppable";
import { TaskItemDraggable } from "../../common/drag-drop/TaskItemDraggable";
import { RecipeModel } from "./recipe-model";
import { useRecipes } from "./useRecipes";


interface RecipeProps {
    index: number
}

export default function Recipe(p: RecipeProps) {
  const recipesActions = useRecipes()
  const form = useFormContext<{recipes: RecipeModel[]}>()

  const [name, color, sections] = useWatch({
    control: form.control,
    name: [`recipes.${p.index}.name`, `recipes.${p.index}.color`, `recipes.${p.index}.sections`], // array of paths
  });

  const errorMessages = form.formState.errors.recipes?.[p.index]

  const onColorSelect = (color: string) => recipesActions.changeRecipeColor(p.index, color)
  const onRecipeDelete = () => recipesActions.deleteTask(p.index)

    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 shadow-[4px_4px_0_black]">
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: color }}>
          {/* Title */}
          <div className="flex grow">
             <Dot />
             <div>
              <input {...form.register(`recipes.${p.index}.name`)} value={name ?? ''} placeholder="Recipe name..."></input>
              { errorMessages?.name?.message &&  <p className="text-red-500 pl-1">{errorMessages?.name?.message}</p>}
             </div>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
            <Popover trigger={<Paintbrush className="cursor-pointer"/>}>
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={onColorSelect}/>
            </Popover>
              { /* <CopyPlus className="cursor-pointer" onClick={recipesActions.createRecipe} /> */}
              { /* <Save className="cursor-pointer" onClick={taskActions.updateTask} color={form.formState.isDirty ? "black" : "gray"}/> */}
              <Trash2 className="cursor-pointer" onClick={onRecipeDelete} />
          </div>
        </div>
          {
            JSON.stringify(sections)
          }
        {/* Task items */}     
        {
          /*
            <DragDropContext onDragEnd={taskActions.moveTaskItem}>
              <TaskItemDroppable droppableId={`task-item-droppable-${form.getValues().id}`} items={items}>
              {
                items.map((item, i) => { return (
                    <TaskItemDraggable index={i} item={item} key={`task-item-draggable-${item.id}`}>
                      <TaskItem key={item.id} data={item} index={i}/>
                    </TaskItemDraggable>
                )})
              }
              </TaskItemDroppable>
            </DragDropContext>
          */
        }  
      </div>
    );
}
