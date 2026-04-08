// Used for generating new item tracking ids that

import { arrayMove } from "@dnd-kit/sortable";
import { dir } from "console";
import { createPortal } from "react-dom";
import { UseFormReturn } from "react-hook-form";

// Only used as keys in the frontend until the item is saved and gets a real id from the backend
export const generateTrackingId = () => {
    return `[new]${crypto.randomUUID()}`
}

// TODO: remove this after we replace it with 'idOrNullIfNew'
export const nullIfTrackingIdElseKeep = (id: string) => {
  return (id.startsWith('[new]')) ? null : id;
}

export const mainIdOrNullIfNew = <TItem extends {id: string | null, isNew: boolean},> (item: TItem) => {
  return item.isNew ? null : item.id
} 

export const idOrNullIfNew = (id: string | null, isNew: boolean) => {
  return isNew ? null : id 
} 

export const maxPlus1Or1 = <TItem,> (collection: TItem[], extractor: (el: TItem) => number) => {
  if(collection.length == 0) return 1
  return Math.max(...collection.map(r => extractor(r))) + 1
}

/**
 * Used since deleting last item in array is not detected in forms as dirty
 * It doesn't properly trigger update sinceo ther items didn't change and deleted one isn't tehnicaly dirty(doesnt exist)
 * @param form 
 * @param formPath 
 */
export const forceFormDirtiness = (form: UseFormReturn<any>, formPath: string) => {
  form.setValue(`${formPath}._forceFormDirtinessFlag`, generateTrackingId(), {shouldDirty: true})
}

/**
 * Mutates original arrays by moving element from source index to destination index.
 * Mutates moved item by 'itemToMoveTransform'.
 * @param source 
 * @param sourceIndex 
 * @param destination 
 * @param destinationIndex 
 * @param itemToMoveTransform 
 * @returns 
 */
export const moveAcrossCollections = <T,> (
  source: T[], 
  sourceIndex: number, 
  destination: T[], 
  destinationIndex: number, 
  itemToMoveTransform?: (item: T) => T
): [T[], T[]] => {
  if(!source || !destination || sourceIndex >= source.length || sourceIndex < 0 || destinationIndex > destination.length || destinationIndex < 0)
    return [source, destination];
  const itemToMove = itemToMoveTransform?.(source[sourceIndex]) || source[sourceIndex];
  source.splice(sourceIndex, 1)
  source.forEach((item, i) => {
    if(objectContainsField(item, 'sortOrder'))
      (item as any).sortOrder = i + 1
  })
  destination.splice(destinationIndex, 0, itemToMove)
  destination.forEach((item, i) => {
    if(objectContainsField(item, 'sortOrder'))
      (item as any).sortOrder = i + 1
  })
  return [[...source], [...destination]];
}

/**
 * Moves element inside collectiona nd returns shallow copy.
 * @param collection 
 * @param fromIndex 
 * @param toIndex 
 * @param itemToMoveTransform 
 * @returns 
 */
export const moveInCollection = <T,> (
  collection: T[], 
  fromIndex: number, 
  toIndex: number
): T[] => {
  if(!collection || fromIndex < 0 || toIndex < 0 || fromIndex >= collection.length || toIndex > collection.length || fromIndex == toIndex)
    return collection;
  const itemToMove = collection[fromIndex]
  const hasSortOrder = objectContainsField(itemToMove, 'sortOrder')
  let newCollection = arrayMove(collection, fromIndex, toIndex)
  if(hasSortOrder) {
    newCollection.forEach((item, i) => {
      (item as any).sortOrder = i + 1;
    });
  }
  return newCollection
}

export const objectContainsField = (
  obj: any,
  fieldName: string
): obj is { [key: string]: any } => {
  return typeof obj === 'object' && obj !== null && fieldName in obj;
}


export const safeCreatePortal = (children: React.ReactNode, elementId: string) => {
  const element = document.getElementById(elementId)
  return element ? 
    createPortal(children, element) : 
    null;
}

/*
 * Extracts real id from drag drop id
 * Strips prefixes like '[type]-draggable-' or '[type]-droppable-' that are used for drag drop library and returns real id that is used in form values and backend
 * TODO: once standars are introduced, we should only have '[type]-container-[id]' for droppable and '[type]-[id]' for draggable
*/
export const idFromDragDropId = (dragDropId: string): string => {
  if(!dragDropId) 
    return dragDropId;
  const prefixesToStrip = ['draggable-', 'droppable-', 'container-']
  prefixesToStrip.forEach(prefix => {
    const prefixIndex = dragDropId?.indexOf(prefix);
    if (prefixIndex !== -1) {
      // Keep everything **after** the prefix
      dragDropId = dragDropId.slice(prefixIndex + prefix.length);
    }
  })
  return dragDropId
}

/**
 * Registers quick create listener that will do action depending on focused element  
 */
export const registerQuickCreateListener = (targetType: string, actions: (data: any) => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey && e.key === "Enter")) return;
      const active = document.activeElement as HTMLElement;
      if (!active) return;
      const container = active.closest("[data-type]");
      if (!container) return;
      const type = container.getAttribute("data-type");
      if(type !== targetType) return;
      const dataString = container.getAttribute("data-data");
      if(!dataString) return;
      const data = JSON.parse(dataString)
      actions(data)
  };
  window.addEventListener("keydown", handleKeyDown);
  return handleKeyDown
}

export const unregisterQuickCreateListener = (quickCreateFunction: (e: KeyboardEvent) => void) => {
  window.removeEventListener("keydown", quickCreateFunction)
}
  