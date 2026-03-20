import { CircleCheck, Plus, Trash2 } from "lucide-react";
import AutosizeTextarea from "@/components/common/AutosizeTextarea";
import { useFormContext } from "react-hook-form";
import { RecipeModel } from "../recipe-model";
import { useRecipes } from "../useRecipes";
import { RecipeSectionType } from "./type";
import TextSectionItem from "./text/text-section-item";
import IngredientsSectionItem from "./ingredient/ingredients-section-item";

interface RecipeSectionItemProps {
  index: number,
  recipeIndex: number
  type: RecipeSectionType
}

export default function RecipeSectionItem(p: RecipeSectionItemProps) {

  switch (p.type) {
    case "TEXT":
      return <TextSectionItem index={p.index} recipeIndex={p.recipeIndex}/>
    case "INGREDIENTS":
      return <IngredientsSectionItem sectionIndex={p.index} recipeIndex={p.recipeIndex}/>
  }
}
