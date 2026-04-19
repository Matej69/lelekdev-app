import { CircleCheck, Copy, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldError, FieldErrorsImpl, Merge, useFormContext, useWatch } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";
import { RecipeSectionModel } from "../recipe-section-schema";
import { RecipeTextSectionModel } from "./recipe-text-section-model";
import SectionTypeSwitch from "../section-type-switch";
import { RecipeSectionType } from "../type";
import { createDataAttributes } from "@/components/common/shortcuts-registration/shortcuts-registration";
import { IconButton } from "@/components/common/IconButton";

interface TextSectionItemProps {
  sectionIndex: number,
  recipeIndex: number
}

export default function TextSectionItem(p: TextSectionItemProps) {
  const form = useFormContext<{recipes: RecipeModel[]}>()
  
  const errors = form.formState.errors.recipes?.[p.recipeIndex]?.sections?.[p.sectionIndex] as Merge<FieldError, FieldErrorsImpl<NonNullable<RecipeTextSectionModel>>>
  const recipesActions = useRecipes()

  const onSectionDelete = () => { recipesActions.deleteRecipeSection(p.recipeIndex, p.sectionIndex) }
  const onChangeRecipeSectionType = (type: RecipeSectionType) => { recipesActions.changeRecipeSectionType(p.recipeIndex, p.sectionIndex, type) }
  const onDuplicateRecipeSection = () => { recipesActions.duplicateRecipeSection(p.recipeIndex, p.sectionIndex) }

  const dataAttributes = createDataAttributes('recipe-section', { recipeIndex: p.recipeIndex, recipeSectionIndex: p.sectionIndex })

  return (
    <div className="flex flex-col bg-white p-2 gap-1" {...dataAttributes}>
        { /* Title and actions */ }
        <div className="flex items-center gap-1">
          <div className="grow">
            <input className="font-bold" {...form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.title`)} placeholder="Recipe text section title"/>
            {
              errors?.title?.message && 
              <p className="text-red-500 px-1 bold">{errors.title.message}</p>
            }
          </div>
          <IconButton icon='duplicate' onClick={onDuplicateRecipeSection} aria-label="Duplicate recipe section" />
          <SectionTypeSwitch defaultType="TEXT" onChange={onChangeRecipeSectionType}></SectionTypeSwitch>
          <IconButton icon='delete' onClick={onSectionDelete} aria-label="Delete recipe section" />
        </div>
        { /* Content */ }
        <div className="flex flex-col items-start gap-2">
          <AutosizeTextarea placeholder="Enter recipe section content" register={form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.content`)} />
          {
            errors?.content?.message && 
            <p className="text-red-500 px-1">{errors.content.message}</p>
          }
        </div>
    </div>
  );
}
