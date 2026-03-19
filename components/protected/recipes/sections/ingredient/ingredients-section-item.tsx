import { CircleCheck, CopyPlus, PencilRuler, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldError, FieldErrorsImpl, Merge, useFormContext, UseFormReturn, useWatch } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";
import { RecipeSectionType } from "../type";
import SectionTypeSwitch from "../section-type-switch";
import { RecipeIngredientSectionModel } from "./recipe-ingredient-section-model";
import { RecipeTextSectionModel } from "../text/recipe-text-section-model";
import IngredientItem from "./ingredient-item";

interface IngredientsSectionItemProps {
  ingredientIndex: number,
  recipeIndex: number
}

export default function IngredientsSectionItem(p: IngredientsSectionItemProps) {
  const form = useFormContext<{recipes: RecipeModel[]}>()
  // Casting errors section to proper type so ingredients can be accessed - We know that only errors
  const section = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.ingredientIndex}`
  }) as RecipeIngredientSectionModel;
  const sectionErrors = form.formState.errors.recipes?.[p.recipeIndex]?.sections?.[p.ingredientIndex]

  const ingredients = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.ingredientIndex}.ingredients`,
  });

  const recipesActions = useRecipes()
  
  const onSectionDelete = () => { recipesActions.deleteRecipeSection(p.recipeIndex, p.ingredientIndex) }
  const onChangeRecipeSectionType = (type: RecipeSectionType) => { recipesActions.changeRecipeSectionType(p.recipeIndex, p.ingredientIndex, type) }
  const onChangeSectionLinkEdit = () => { recipesActions.toogleSectionLinkEdit(p.recipeIndex, p.ingredientIndex)}
  const onCreateIngredient = () => { recipesActions.createIngredient(p.recipeIndex, p.ingredientIndex) }
  
  return (
     <div className="flex flex-col bg-white p-2 gap-1">
         { /* Title and actions */ }
         <div className="flex items-center gap-1">
           <div className="grow">
             <input className="font-bold" {...form.register(`recipes.${p.recipeIndex}.sections.${p.ingredientIndex}.title`)} placeholder="Enter title"/>
             { sectionErrors?.title?.message && <p className="text-red-500 px-1 bold">{sectionErrors.title.message}</p>}
           </div>
           <CopyPlus className="cursor-pointer" onClick={onCreateIngredient} />
           <SectionTypeSwitch defaultType="INGREDIENTS" onChange={onChangeRecipeSectionType}></SectionTypeSwitch>
           <PencilRuler size={26} className="cursor-pointer" onClick={onChangeSectionLinkEdit} color={section.linkedAmountUpdate ? "black" : "#bababa"} />
           <Trash2 size={26} className="cursor-pointer"  onClick={onSectionDelete} />
         </div>
         { /* Ingredients */ }
         <div className="flex flex-col items-start gap-2">
          {
            ingredients.map((ingredient, ingredientIndex) => {
              return <IngredientItem key={ingredient.id} recipeIndex={p.recipeIndex} sectionIndex={p.ingredientIndex} ingredientIndex={ingredientIndex}/>
            })
          }
         </div>
     </div>
  );
}