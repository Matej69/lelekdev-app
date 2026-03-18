import { CircleCheck, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldError, FieldErrorsImpl, Merge, useFormContext, useWatch } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";
import { RecipeSectionModel } from "../recipe-section-schema";
import { RecipeTextSectionModel } from "./recipe-text-section-model";
import SectionTypeSwitch from "../section-type-switch";
import { RecipeSectionType } from "../type";

interface TextSectionItemProps {
  index: number,
  recipeIndex: number
}

export default function TextSectionItem(p: TextSectionItemProps) {
  const form = useFormContext<{recipes: RecipeModel[]}>()
  
  const errors = form.formState.errors.recipes?.[p.recipeIndex]?.sections?.[p.index] as Merge<FieldError, FieldErrorsImpl<NonNullable<RecipeTextSectionModel>>>
  const recipesActions = useRecipes()

  const onSectionDelete = () => { recipesActions.deleteRecipeSection(p.recipeIndex, p.index) }
  const onChangeRecipeSectionType = (type: RecipeSectionType) => { recipesActions.changeRecipeSectionType(p.recipeIndex, p.index, type) }

  return (
    <div className="flex flex-col bg-white p-2 gap-1">
        { /* Title and actions */ }
        <div className="flex items-center gap-1">
          <div className="grow">
            <input className="font-bold" {...form.register(`recipes.${p.recipeIndex}.sections.${p.index}.title`)} placeholder="Enter title"/>
            {
              errors?.title?.message && 
              <p className="text-red-500 px-1 bold">{errors.title.message}</p>
            }
          </div>
          <SectionTypeSwitch defaultType="TEXT" onChange={onChangeRecipeSectionType}></SectionTypeSwitch>
          <Trash2 size={26} className=" cursor-pointer" onClick={onSectionDelete} />
        </div>
        { /* Content */ }
        <div className="flex flex-col items-start gap-2">
          <AutosizeTextarea placeholder="Enter content" register={form.register(`recipes.${p.recipeIndex}.sections.${p.index}.content`)} />
          {
            errors?.content?.message && 
            <p className="text-red-500 px-1">{errors.content.message}</p>
          }
        </div>
    </div>
  );
}
