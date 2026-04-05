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
    dragged: DragActiveParticipantSchema,
    target: DragOverParticipantSchema,
    activeSnapshot: DragActiveParticipantSchema,
    draggedOn: z.object({
        sameItem: z.boolean(),
        sameContainer: z.boolean(),
        sameType: z.boolean(),
        container: z.boolean()
    })
})
export type DragEvent = z.infer<typeof DragEventSchema>
export type DragAction = DragEvent['action']

/**
 * @param dragAction 
 * @param event 
 * @param activeSnapshot 
 * @returns 
 */
export const mapEventToDragData = (
    dragAction: DragAction, 
    event: DragOverEvent, 
    activeSnapshot: DragStartEvent['active']['data']['current'] | null
): DragEvent | null => {
    const active = event?.active.data.current
    const over = event?.over?.data.current
    const draggedOverContainer = ['container', 'droppable'].some(str => (typeof over?.type === 'string' && over?.type.includes(str)))
    const result = DragEventSchema.safeParse({
        action: dragAction,
        dragged: {
            id: idFromDragDropId(active?.item?.id),
            index: active?.index,
            type: active?.type,
            groupId: idFromDragDropId(active?.containerId),
            acceptTypes: active?.acceptTypes || []
        },
        target: {
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
        },
        draggedOn: {
            sameItem: draggedOverContainer ? 
                false : 
                idFromDragDropId(active?.item?.id) === idFromDragDropId(over?.item?.id),
            sameContainer: draggedOverContainer ? 
                idFromDragDropId(active?.containerId) === idFromDragDropId(over?.item?.id) :  
                idFromDragDropId(active?.containerId) === idFromDragDropId(over?.containerId),
            sameType: active?.type === over?.type,
            container: draggedOverContainer
        }
    } satisfies DragEvent)
    if(!result.success)
        return null;
    return result.data
};
