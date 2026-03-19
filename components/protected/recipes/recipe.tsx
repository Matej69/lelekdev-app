'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
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
import { DragDropDroppable } from "../../common/drag-drop/DragDropDroppable";
import { DragDropDraggable } from "../../common/drag-drop/DragDropDraggable";
import { RecipeModel } from "./recipe-model";
import { useRecipes } from "./useRecipes";
import RecipeSectionItem from "./sections/section-item";
import { DragDropHandlerContext } from "@/app/DragDropProvider";


interface RecipeProps {
    index: number
}

export default function Recipe(p: RecipeProps) {
  const recipesActions = useRecipes()
  const form = useFormContext<{recipes: RecipeModel[]}>()
  const [id, name, color, sections] = useWatch({
    control: form.control,
    name: [`recipes.${p.index}.id`, `recipes.${p.index}.name`, `recipes.${p.index}.color`, `recipes.${p.index}.sections`], // array of paths
  });
  const errorMessages = form.formState.errors.recipes?.[p.index]

  const dragDropContext = useContext(DragDropHandlerContext)
  useEffect(() => {
    dragDropContext.registerHandler(`recipe-section`, recipesActions.moveRecipeSection)
  }, [])

  const onColorSelect = (color: string) => recipesActions.changeRecipeColor(p.index, color)
  const onRecipeDelete = () => recipesActions.deleteRecipe(p.index)
  const onRecipeUpdate = () => { recipesActions.updateRecipe(p.index) }
  const onRecipeCreateSection = () => { recipesActions.createRecipeSection(p.index) }

    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 shadow-[4px_4px_0_black]">
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: color }}>
          {/* Title */}
          <div className="flex grow">
             <Dot />
             <div>
              <input {...form.register(`recipes.${p.index}.name`)} placeholder="Recipe name..."></input>
              { errorMessages?.name?.message &&  <p className="text-red-500 pl-1">{errorMessages?.name?.message}</p>}
             </div>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
            <Popover trigger={<Paintbrush className="cursor-pointer"/>}>
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={onColorSelect}/>
            </Popover>
              { <CopyPlus className="cursor-pointer" onClick={onRecipeCreateSection} /> }
              <Save className="cursor-pointer" onClick={onRecipeUpdate} color={form.formState.isDirty ? "black" : "gray"}/>
              <Trash2 className="cursor-pointer" onClick={onRecipeDelete} />
          </div>
        </div>
        {/* Recipe sections */}    
        <DragDropDroppable droppableId={`${id}`} type={`recipe-section`}>
          {
            sections.map((section, i) => { return (
              <DragDropDraggable index={i} draggableId={section.id} key={`${section.id}`}>
                <RecipeSectionItem key={section.id} index={i} type={section.type} recipeIndex={p.index} />
              </DragDropDraggable>
            )})
          }  
        </DragDropDroppable>  
      </div>
    );
}
