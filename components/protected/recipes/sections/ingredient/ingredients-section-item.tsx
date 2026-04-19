import { CircleCheck, Copy, CopyPlus, Icon, PencilRuler, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { FieldError, FieldErrorsImpl, Merge, useFormContext, UseFormReturn, useWatch } from "react-hook-form";
import { RecipeModel } from "../../recipe-model";
import { useRecipes } from "../../useRecipes";
import { RecipeSectionType } from "../type";
import SectionTypeSwitch from "../section-type-switch";
import { RecipeIngredientSectionModel } from "./recipe-ingredient-section-model";
import { RecipeTextSectionModel } from "../text/recipe-text-section-model";
import IngredientItem from "./ingredient-item";
import { DragDropDroppable, DragDropDroppableProps } from "@/components/common/drag-drop/DragDropDroppable";
import { DragDropDraggable, DragDropDraggableProps } from "@/components/common/drag-drop/DragDropDraggable";
import { useContext, useEffect } from "react";
import { DragDropHandlerContext } from "@/components/common/drag-drop/DragDropProvider";
import { createDataAttributes, registerShortcutListener, unregisterShortcutListener } from "@/components/common/shortcuts-registration/shortcuts-registration";
import { IconButton } from "@/components/common/IconButton";

interface IngredientsSectionItemProps {
  sectionIndex: number,
  recipeIndex: number
}

export default function IngredientsSectionItem(p: IngredientsSectionItemProps) {
  const form = useFormContext<{recipes: RecipeModel[]}>()
  // Casting errors section to proper type so ingredients can be accessed - We know that only errors
  const section = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.sectionIndex}`
  }) as RecipeIngredientSectionModel;
  const sectionErrors = form.formState.errors.recipes?.[p.recipeIndex]?.sections?.[p.sectionIndex]

  const ingredients = useWatch({
    control: form.control,
    name: `recipes.${p.recipeIndex}.sections.${p.sectionIndex}.ingredients`,
  });

  const recipesActions = useRecipes()

  const dragDropContext = useContext(DragDropHandlerContext)
  useEffect(() => {
    dragDropContext.registerHandler(`ingredient`, recipesActions.moveRecipeIngredient)
  }, [])
  
  const onSectionDelete = () => { recipesActions.deleteRecipeSection(p.recipeIndex, p.sectionIndex) }
  const onChangeRecipeSectionType = (type: RecipeSectionType) => { recipesActions.changeRecipeSectionType(p.recipeIndex, p.sectionIndex, type) }
  const onChangeSectionLinkEdit = () => { recipesActions.toogleSectionLinkEdit(p.recipeIndex, p.sectionIndex)}
  const onCreateIngredient = () => { recipesActions.createIngredient(p.recipeIndex, p.sectionIndex) }
  const onDuplicateRecipeSection = () => { recipesActions.duplicateRecipeSection(p.recipeIndex, p.sectionIndex) }

  const droppableIngredientsIds = section.ingredients?.map(r => ({ id: `ingredient-draggable-${r.id}` })) || []

  const droppableProps: Omit<DragDropDroppableProps, 'children'> = {
      id: `${section.id}`,
      type: "ingredient-container",
      acceptTypes: ["ingredient"],
      items: droppableIngredientsIds,
      item: section,
    };
  
  const draggableProps = (ingredient: { id: string }, index: number): Omit<DragDropDraggableProps, 'children'> => ({
    id: `ingredient-draggable-${ingredient.id}`,
    index: index,
    type: "ingredient",
    acceptTypes: ["ingredient"],
    containerId: section.id,
    item: ingredient,
  });

  const linkUpdateProps = {
    ariaLabel: section.linkedAmountUpdate ? "Unlink ingredient amounts" : "Link ingredient amounts",
    color: section.linkedAmountUpdate ? "black" : "#bababa",
  }

  const dataAttributes = createDataAttributes('recipe-section', { recipeIndex: p.recipeIndex, recipeSectionIndex: p.sectionIndex })
  
  return (
     <div className="flex flex-col bg-white p-2 gap-1" {...dataAttributes}>
         { /* Title and actions */ }
         <div className="flex items-center gap-1">
           <div className="grow">
             <input className="font-bold" {...form.register(`recipes.${p.recipeIndex}.sections.${p.sectionIndex}.title`)} placeholder="Recipe ingredient section title"/>
             { sectionErrors?.title?.message && <p className="text-red-500 px-1 bold">{sectionErrors.title.message}</p>}
           </div>
           <IconButton icon='add' onClick={onCreateIngredient} aria-label="Add ingredient" />
           <IconButton icon='duplicate' onClick={onDuplicateRecipeSection} aria-label="Duplicate recipe section" />
           <IconButton icon='linkEdit' onClick={onChangeSectionLinkEdit} aria-label={linkUpdateProps.ariaLabel} iconProps={{ color: linkUpdateProps.color }}  />
           <SectionTypeSwitch defaultType="INGREDIENTS" onChange={onChangeRecipeSectionType}></SectionTypeSwitch>
           <IconButton icon='delete' onClick={onSectionDelete} aria-label="Delete recipe section" />
         </div>
         { /* Ingredients */ }
        <DragDropDroppable {...droppableProps} style={{ minHeight: '1.7rem', background: 'white' }}>
            {
              ingredients.map((ingredient, ingredientIndex) => { return (
                <DragDropDraggable key={`${ingredient.id}-${ingredientIndex}`} {...draggableProps(ingredient, ingredientIndex)}>
                  <IngredientItem recipeIndex={p.recipeIndex} sectionIndex={p.sectionIndex} ingredientIndex={ingredientIndex}/>
                </DragDropDraggable>
              )})
            }  
        </DragDropDroppable> 
     </div>
  );
}