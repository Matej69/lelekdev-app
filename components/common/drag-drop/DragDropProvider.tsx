'use client'

import { createContext, ReactNode, useRef, useState } from 'react';
import { Active, Collision, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { mapEventToDragData, DragEvent } from './DragEvent';
import { DroppableContainer, RectMap } from '@dnd-kit/core/dist/store';
import { Coordinates } from '@dnd-kit/utilities';

/**
 * Strategy that pripriorizes droppable elements based on the type of the active draggable item.
 * When a drag event occurs, it checks the type of the active draggable item and sorts the potential droppable targets accordingly.
 * Droppable elements that match or partialy match the type of the active draggable item are given higher priority, ensuring that they are considered first for drop interactions.
 * Main problem this solves is that it allows transition animation to play normally when item is dragged over its container
 * @param args 
 * @returns 
 */
const collisionDetectionStrategy: Parameters<typeof DndContext>["0"]["collisionDetection"] = (args) => {
    const collisions = pointerWithin(args);
    if (!collisions) return [];
    const activeType = args.active?.data?.current?.type ?? '';
    const priorityTypes = [`${activeType}-container`, `${activeType}-draggable`, `${activeType}-droppable`]
    const sorted = collisions.sort((a, b) => {
      const [aId, bId] = [`${a.id}`, `${b.id}`]
      const aPriority = priorityTypes.some((t) => aId.includes(t)) ? 0 : 1;
      const bPriority = priorityTypes.some((t) => bId.includes(t)) ? 0 : 1;
      return aPriority - bPriority;
    });
    return sorted;
}

/**
 * Context
 */
export const DragDropHandlerContext = createContext<{
  registerHandler: (type: string, handler: (dragEvent: DragEvent) => void) => void
}>({ 
    registerHandler: () => {},
});

export function DragDropProvider({ children }: { children: ReactNode })  {
    const moveHandlers = useRef<{ [type: string]: (dragEvent: DragEvent) => void }>({})
    const [activeItemSnapshot, setActiveItemSnapshot] = useState<DragStartEvent['active']['data']['current'] | null>(null)

    const sensors = useSensors(useSensor(
        PointerSensor, { activationConstraint: { distance: 3 } }
    ))

    const registerHandler = (type: string, handler: (dragEvent: DragEvent) => void) => {
        moveHandlers.current[type] = handler
    }

    const onDragStart = (event: DragStartEvent) => {
        setActiveItemSnapshot(event.active.data.current)
    }
    
    const onDragOver = (event: DragOverEvent) => {
        const {action, active, over, activeSnapshot} = mapEventToDragData('drag-over', event, activeItemSnapshot) || {}
        if(!active || !over)
            return;
        //if(active.id === over.id)
        //    return;
        const overAcceptsActive = over.acceptTypes.includes(active.type)
        if(overAcceptsActive && action && activeSnapshot && active.groupId !== over.groupId && active.index != null) {
            moveHandlers.current[active.type]?.({action, active, over, activeSnapshot})
        }
    }
    
    const onDragEnd = (event: DragEndEvent) => {
        const {action, active, over, activeSnapshot} = mapEventToDragData('drag-end', event, activeItemSnapshot) || {}
        if(!active || !over)
            return;
        // if(active.id === over.id)
        //     return;
        const overAcceptsActive = over.acceptTypes.includes(active.type)
        if(overAcceptsActive && action && activeSnapshot && active.groupId == over.groupId && active.type == over.type && active.index != null && over.index != null) {
            moveHandlers.current[active.type]?.({action, active, over, activeSnapshot})
        }
        setActiveItemSnapshot(null)
    }


    return (
        <DragDropHandlerContext.Provider value={{ registerHandler }}>
            <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy}
            onDragEnd={onDragEnd} onDragStart={onDragStart} onDragOver={onDragOver}>
                {children}
                <DragOverlay dropAnimation={null} style={{ cursor: 'pointer' }}>
                        { /*activeItem && <DraggableSkeleton/>*/ }
                </DragOverlay>
            </DndContext>
        </DragDropHandlerContext.Provider>
    );
};