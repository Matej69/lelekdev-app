// Used for generating new item tracking ids that

import { arrayMove } from "@dnd-kit/sortable";
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
  itemToMoveTransform?: (item: T) => T
): T[] => {
  if(!collection || fromIndex >= collection.length || toIndex > collection.length)
    return collection;
  itemToMoveTransform?.(collection[fromIndex])
  return arrayMove(collection, fromIndex, toIndex)
}

export const updateSortOrderOnItemMove = <T extends {sortOrder: number},> (collection: T[], movedFromIndex: number, movedToIndex: number): T[] => {
  if(!collection || movedFromIndex < 0 || movedFromIndex >= collection.length || movedToIndex < 0 || movedToIndex >= collection.length)
    return collection;
  const [movedDown, movedUp] = [movedFromIndex < movedToIndex, movedFromIndex > movedToIndex]
  collection.forEach((item, i) => {
      if(
        (movedDown && i >= movedFromIndex && i <= movedToIndex) ||
        (movedUp && i >= movedToIndex && i <= movedFromIndex)
      )
        item.sortOrder = i + 1
    })
  return [...collection]
}

