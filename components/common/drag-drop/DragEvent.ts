import { DragOverEvent, DragStartEvent } from "@dnd-kit/core";
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

const DragEventSchema = z.object({
    action: z.enum(['drag-end', 'drag-over']),
    active: DragActiveParticipantSchema,
    over: DragOverParticipantSchema,
    activeSnapshot: DragActiveParticipantSchema
})
export type DragEvent = z.infer<typeof DragEventSchema>
export type DragAction = DragEvent['action']

export const mapEventToDragData = (
    dragAction: DragAction, 
    event: DragOverEvent, 
    activeSnapshot: DragStartEvent['active']['data']['current'] | null
): DragEvent | null => {
    const active = event?.active.data.current
    const over = event?.over?.data.current
    const result = DragEventSchema.safeParse({
      action: dragAction,
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
      activeSnapshot: {
        id: idFromDragDropId(activeSnapshot?.item?.id),
        index: activeSnapshot?.index,
        type: activeSnapshot?.type,
        groupId: idFromDragDropId(activeSnapshot?.containerId),
        acceptTypes: activeSnapshot?.acceptTypes || []
      }
    })
    if(!result.success)
        return null;
    return result.data
};
