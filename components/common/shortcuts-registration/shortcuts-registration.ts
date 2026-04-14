import { z } from "zod"

const dataAttributesTypeRegister = {
  'task-item': z.object({
      taskIndex: z.number(),
      taskItemIndex: z.number()
    }),
  'recipe-section-ingredient': z.object({
      recipeIndex: z.number(),
      recipeSectionIndex: z.number(),
      recipeSectionIngredientIndex: z.number()
    })
}
type DataAttributesKeys = keyof typeof dataAttributesTypeRegister
type DataAttributesPropertiesRegister = {
  [K in DataAttributesKeys]: z.infer<typeof dataAttributesTypeRegister[K]>
}

const keyboardShortcuts = {
  create: (e: KeyboardEvent) => (e.altKey || e.ctrlKey) && e.key === "Enter",
  delete: (e: KeyboardEvent) => (e.altKey || e.ctrlKey) && e.key === "Delete",
  save: (e: KeyboardEvent) => (e.altKey || e.ctrlKey) && e.key === "s",
  moveUp: (e: KeyboardEvent) => (e.altKey || e.ctrlKey) && e.key === "ArrowUp",
  moveDown: (e: KeyboardEvent) => (e.altKey || e.ctrlKey) && e.key === "ArrowDown"
}
export type KeyboardShortcutKeys = keyof typeof keyboardShortcuts

export const createDataAttributes = <T extends DataAttributesKeys>(dataType: T, data: DataAttributesPropertiesRegister[T]) => {
  return {
    'data-type': dataType,
    'data-data': JSON.stringify(data)
  }
}

export const registerShortcutListener = <T extends DataAttributesKeys> (
  targetType: T, 
  shortcut: KeyboardShortcutKeys, 
  actions: (data: DataAttributesPropertiesRegister[T]) => void
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardShortcuts[shortcut](e)) return;
      const active = document.activeElement as HTMLElement;
      if (!active) return;
      const container = active.closest("[data-type]");
      if (!container) return;
      const type = container.getAttribute("data-type");
      if(type !== targetType) return;
      const dataString = container.getAttribute("data-data");
      if(!dataString) return;
      const data = JSON.parse(dataString)
      const isDataValid = dataAttributesTypeRegister[targetType].safeParse(data)
      if(!isDataValid.success) return;
      actions(data)
  };
  window.addEventListener("keydown", handleKeyDown);
  return handleKeyDown
}

export const unregisterShortcutListener = (shortcutFunction: (e: KeyboardEvent) => void) => {
  window.removeEventListener("keydown", shortcutFunction)
}