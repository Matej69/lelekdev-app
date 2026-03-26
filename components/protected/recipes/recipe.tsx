'use client';

import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { Check, CircleCheck, CopyPlus, Delete, DeleteIcon, Dot, Paintbrush, Plus, Save, SquareCheck, Trash, Trash2 } from "lucide-react";
import { CSSProperties, useContext, useEffect, useState } from "react";
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
import { DragDropDroppable } from "../../common/drag-drop/DragDropDroppable";
import { DragDropDraggable } from "../../common/drag-drop/DragDropDraggable";
import { RecipeModel } from "./recipe-model";
import { useRecipes } from "./useRecipes";
import RecipeSectionItem from "./sections/section-item";
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider";


interface RecipeProps {
    recipeIndex: number
}

export default function Recipe(p: RecipeProps) {
  const recipesActions = useRecipes()
  const form = useFormContext<{recipes: RecipeModel[]}>()
  const [id, name, color, sections] = useWatch({
    control: form.control,
    name: [
      `recipes.${p.recipeIndex}.id`, 
      `recipes.${p.recipeIndex}.name`, 
      `recipes.${p.recipeIndex}.color`, 
      `recipes.${p.recipeIndex}.sections`
    ],
  });
  const errorMessages = form.formState.errors.recipes?.[p.recipeIndex]

  const recipeDirtyFields = form.formState.dirtyFields.recipes?.[p.recipeIndex]
  const isAnyFieldDirty = recipeDirtyFields ? Object.keys(recipeDirtyFields).length > 0 : false;
    
  const dragDropContext = useContext(DragDropHandlerContext)
  useEffect(() => {
    dragDropContext.registerHandler(`recipe-section`, recipesActions.moveRecipeSection)
    dragDropContext.registerSwapHandler(`recipe-section`, recipesActions.swapRecipeSection)
  }, [])

  const containerShadowStyle: CSSProperties = { boxShadow: `4px 4px 0 ${isAnyFieldDirty ? "#ccc" : "black"}` }

  const onColorSelect = (color: string) => recipesActions.changeRecipeColor(p.recipeIndex, color)
  const onRecipeDelete = () => recipesActions.deleteRecipe(p.recipeIndex)
  const onRecipeUpdate = () => { isAnyFieldDirty && recipesActions.updateRecipe(p.recipeIndex);}
  const onRecipeCreateSection = () => { recipesActions.createRecipeSection(p.recipeIndex) }

    return (
      <div className="flex flex-col w-full justify-center font-sans border border-gray-400 transition-shadow duration-300 bg-white" style={containerShadowStyle}>
        {/* Header */}
        <div className="flex justify-center p-2" style={{ background: color }}>
          {/* Title */}
          <div className="flex grow">
             <Dot />
             <div>
              <input {...form.register(`recipes.${p.recipeIndex}.name`)} placeholder="Recipe name..."></input>
              { errorMessages?.name?.message &&  <p className="text-red-500 pl-1">{errorMessages?.name?.message}</p>}
             </div>
          </div>
          {/* Actions */}
          <div className="flex items-center group hover:cursor-pointer gap-3">
            <Popover trigger={<Paintbrush className="cursor-pointer"/>}>
                <ColorPicker className="grid grid-cols-4 gap-1" hexColors={Object.values(taskColors)} onColorSelect={onColorSelect}/>
            </Popover>
              { <CopyPlus className="cursor-pointer" onClick={onRecipeCreateSection} /> }
              <Save className="cursor-pointer" onClick={onRecipeUpdate} color={isAnyFieldDirty ? "black" : "gray"}/>
              <Trash2 className="cursor-pointer" onClick={onRecipeDelete} />
          </div>
        </div>
        {/* Recipe sections */}    
        <DragDropDroppable id={`${id}`} items={sections} type="recipe-section-container" acceptTypes={["recipe-section"]}>
          {
            sections.map((section, sectionIndex) => { return (
              <DragDropDraggable item={section} id={section.id} containerId={id} index={sectionIndex} type="recipe-section" key={`${section.id}`}>
                <RecipeSectionItem key={`${section.id}-${sectionIndex}`} index={sectionIndex} type={section.type} recipeIndex={p.recipeIndex} />
              </DragDropDraggable>
            )})
          }  
        </DragDropDroppable>  
      </div>
    );
}
