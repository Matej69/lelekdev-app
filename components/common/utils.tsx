// Used for generating new item tracking ids that

import { arrayMove } from "@dnd-kit/sortable";
import { dir } from "console";
import { UseFormReturn } from "react-hook-form";

// Only used as keys in the frontend until the item is saved and gets a real id from the backend
export const generateTrackingId = () => {
    return `[new]${crypto.randomUUID()}`
}

// TODO: remove this after we replace it with 'idOrNullIfNew'
export const nullIfTrackingIdElseKeep = (id: string) => {
  return (id.startsWith('[new]')) ? null : id;
}

export const idOrNullIfNew = <TItem extends {id: string | null, isNew: boolean},> (item: TItem) => {
  return item.isNew ? null : item.id
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
  if(!source || !destination || sourceIndex >= source.length || destinationIndex > destination.length)
    return [source, destination];
  const itemToMove = itemToMoveTransform?.(source[sourceIndex]) || source[sourceIndex];
  source.splice(sourceIndex, 1)
  destination.splice(destinationIndex, 0, itemToMove)
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
  toIndex: number, 
  //itemToMoveTransform?: (item: T) => T
): T[] => {
  if(!collection || fromIndex < 0 || toIndex < 0 || fromIndex >= collection.length || toIndex > collection.length || fromIndex == toIndex)
    return collection;
  const itemToMove = collection[fromIndex]
  // If item has 'sortOrder' shift items in between by 1 in the right direction
  const hasSortOrder = objectContainsField(itemToMove, 'sortOrder')
  if(hasSortOrder) {
    (itemToMove as any).sortOrder = toIndex + 1
    const sortShiftData =
      fromIndex < toIndex ? { start: fromIndex + 1, end: toIndex, moveAmount: -1 } : // item moved down, items in between should move up
      fromIndex > toIndex ? { start: toIndex, end: fromIndex - 1, moveAmount: 1 } : // item moved up, items in between should move down
      null;
      collection.forEach((item, i) => {
        if(sortShiftData && i >= sortShiftData?.start && i <= sortShiftData?.end) {
          (item as any).sortOrder += sortShiftData.moveAmount
        }
      })
  }
  // Move item
  const newCollection = arrayMove(collection, fromIndex, toIndex)
  //itemToMoveTransform?.(itemToMove)
  return newCollection
}

export const objectContainsField = (
  obj: any,
  fieldName: string
): obj is { [key: string]: any } => {
  return typeof obj === 'object' && obj !== null && fieldName in obj;
}