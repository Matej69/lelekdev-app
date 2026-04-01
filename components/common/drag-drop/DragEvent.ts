import { DragOverEvent } from "@dnd-kit/core";
import { z } from 'zod' 
import { idFromDragDropId } from "../utils";

//export interface DragParticipant {
//    id: string,
//    index: number,
//    type: string,
//    groupId: string
//}
//export interface DragEvent {
//   active: DragParticipant,
//   over: DragParticipant
//}
const DragActiveParticipantSchema = z.object({
    id: z.string(),
    index: z.number(),
    type: z.string(),
    groupId: z.string(),
    acceptTypes: z.array(z.string())
})
const DragOverParticipantSchema = z.object({
    id: z.string(),
    index: z.number().nullish(),
    type: z.string(),
    groupId: z.string().nullish(),
    acceptTypes: z.array(z.string())
})

type DragParticipantKeys = keyof z.infer<typeof DragActiveParticipantSchema>

const DragEventSchema = z.object({
    active: DragActiveParticipantSchema,
    over: DragOverParticipantSchema
})
export type DragEvent = z.infer<typeof DragEventSchema>

export const mapEventToDragData = (event: DragOverEvent): DragEvent | null => {
    const active = event?.active.data.current
    const over = event?.over?.data.current
    const result = DragEventSchema.safeParse({
      active: {
          id: idFromDragDropId(active?.item?.id),
          index: active?.index,
          type: active?.type,
          groupId: idFromDragDropId(active?.containerId),
          acceptTypes: active?.acceptTypes || []
      },
      over: {
          id: idFromDragDropId(over?.item?.id),
          index: over?.index,
          type: over?.type,
          groupId: idFromDragDropId(over?.containerId),
          acceptTypes: over?.acceptTypes || []
      },
    })
    if(!result.success)
        return null;
    return result.data
};