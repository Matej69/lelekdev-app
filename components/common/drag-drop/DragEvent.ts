import { DragOverEvent } from "@dnd-kit/core";
import { z } from 'zod' 

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
          id: active?.item?.id,
          index: active?.index,
          type: active?.type,
          groupId: active?.containerId,
          acceptTypes: active?.acceptTypes || []
      },
      over: {
          id: over?.item?.id,
          index: over?.index,
          type: over?.type,
          groupId: over?.containerId,
          acceptTypes: over?.acceptTypes || []
      },
    })
    if(!result.success)
        return null;
    return result.data
};


export const isEqual = (
  event: DragOverEvent,
  key: DragParticipantKeys
): boolean => {
    const { active, over } = event
    let activeValue
    let overValue
    if(key == 'id') {
        activeValue = active?.['id'];
        overValue = over?.['id'];
    }
    else {
        const activeData = event.active.data.current?.item;
        const overData = event.over?.data.current?.item;
        activeValue = activeData?.[key];
        overValue = overData?.[key];
    }
    if (activeValue == null || overValue == null) 
      return false;
    return overValue === overValue;
};
