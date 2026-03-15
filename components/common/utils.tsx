// Used for generating new item tracking ids that
// Only used as keys in the frontend until the item is saved and gets a real id from the backend
export const generateTrackingId = () => {
    return `[new]${crypto.randomUUID()}`
}


export const nullIfTrackingIdElseKeep = (id: string) => {
  return (id.startsWith('[new]')) ? null : id;
}

export const maxPlus1Or1 = <TItem,> (collection: TItem[], extractor: (el: TItem) => number) => {
  if(collection.length == 0) return 1
  return Math.max(...collection.map(r => extractor(r))) + 1
}