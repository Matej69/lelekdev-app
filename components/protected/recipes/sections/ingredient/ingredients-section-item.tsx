import { CircleCheck, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { useFormContext } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";

interface IngredientsSectionItemProps {
  index: number,
  recipeIndex: number
}

export default function IngredientsSectionItem(p: IngredientsSectionItemProps) {
  const form = useFormContext<RecipeModel>()
  const errors = form.formState.errors.sections?.[p.index]
  const recipesActions = useRecipes()


  return (
    <div className="flex flex-col bg-white p-2">
      <p>INGREDIENT SECTION</p>
      <div className="flex items-center gap-2">
        <AutosizeTextarea placeholder="Enter content" register={form.register(`items.${p.index}.content`)} />
        <Trash2 size={30} className=" cursor-pointer" onClick={() => recipesActions.deleteTaskItem(p.index)} />
      </div>
      {
        errors?.content?.message && 
        <p className="text-red-500 pl-12 pr-6">{errors.content.message}</p>
      }
    </div>
  );
}
