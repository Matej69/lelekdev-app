import { CircleCheck, PencilRuler, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldError, FieldErrorsImpl, Merge, useFormContext, UseFormReturn, useWatch } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";
import { RecipeSectionType } from "../type";
import SectionTypeSwitch from "../section-type-switch";
import { RecipeIngredientSectionModel } from "./recipe-ingredient-section-model";
import { RecipeTextSectionModel } from "../text/recipe-text-section-model";
import { createDataAttributes } from "@/components/common/shortcuts-registration/shortcuts-registration";

interface IngredientItemProps {
  recipeIndex: number,
  sectionIndex: number,
  ingredientIndex: number,
}

export default function IngredientItem(p: IngredientItemProps) {
  const form = useFormContext<{recipes: RecipeModel[]}>()
  // Casting errors section to proper type so ingredients can be accessed - We know that only errors
  const section = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.sectionIndex}`
  }) as RecipeIngredientSectionModel;

  const ingredients = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients`,
  });

  const recipesActions = useRecipes()
  
  const onChangeIngredientAmount = (e: React.ChangeEvent<HTMLInputElement>, ingredientIndex: number) => { 
    const oldAmount = form.getValues(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${ingredientIndex}`)?.amount
    const newAmount = +e.target.value
    if(isNaN(oldAmount) || isNaN(newAmount))
      return;
    console.log(newAmount)
    recipesActions.changeIngredientAmount(p.recipeIndex, p.sectionIndex, ingredientIndex, oldAmount, newAmount, section.linkedAmountUpdate)
  }
  const onDeleteIngredient = () => recipesActions.deleteIngredient(p.recipeIndex, p.sectionIndex, p.ingredientIndex)
  
  const ingredientsError = (form.formState.errors.recipes?.[p.recipeIndex]?.sections?.[p.sectionIndex] as Merge<FieldError, FieldErrorsImpl<NonNullable<RecipeIngredientSectionModel>>>)?.ingredients?.[p.ingredientIndex]

  const dataAttributes = createDataAttributes('recipe-section-ingredient', { recipeIndex: p.recipeIndex, recipeSectionIndex: p.sectionIndex, recipeSectionIngredientIndex: p.ingredientIndex })

  const { ref } = form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${p.ingredientIndex}.amount`, {
  });

  return <div className="w-full" {...dataAttributes}>
    <div className="flex w-full">
      <div>
        <input 
          ref={ref}
          key={form.watch(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${p.ingredientIndex}.amount`)} // For rerendering since we use 'defaultValue' 
          type="number" inputMode="numeric" className="field-sizing-content" placeholder="Amount"
          defaultValue={form.getValues(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${p.ingredientIndex}.amount`)} // Used because of onBlur
          onBlur = { (e) => {onChangeIngredientAmount(e, p.ingredientIndex)} } // Update is not done onChange since linked ingredient update goes nuts
        />
      </div>
      <div className="">
        <input className="field-sizing-content" {...form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${p.ingredientIndex}.unit`)} placeholder="Unit"/>
      </div>
      <div className="grow">
        <input className="field-sizing-content" {...form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients.${p.ingredientIndex}.name`)} placeholder="Name"/>
      </div>
      <div className="">
        <Trash2 size={26} className="cursor-pointer" onClick={onDeleteIngredient}/>
      </div>
    </div>
        { ingredientsError?.amount?.message && <p className="pl-1 text-red-500 px-1 bold">{ingredientsError.amount.message}</p>}
        { ingredientsError?.unit?.message && <p className="pl-1 text-red-500 px-1 bold">{ingredientsError.unit.message}</p>}
        { ingredientsError?.name?.message && <p className="pl-1 text-red-500 px-1 bold">{ingredientsError.name.message}</p>}
  </div> 
}