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
    
    /**
     * Triggered once when item is dragged over different container that accept that item type
     * Should not be used to mutate state on abckend by calling api since drag end confirms changes to backend. Drag over jus changes app state, does not commits it untill drag ends
     * * Used for:
     *  1. Different container drag  - applies state immediately on enter
     * Every movement of dragged item after it was moved to new section will not trigger another drag over event, instead, library itself will visually move it arorund
     * @param event 
     * @returns 
     */
    const onDragOver = (event: DragOverEvent) => {
        const dragData = mapEventToDragData('drag-over', event, activeItemSnapshot)
        if(!dragData) return;
        const {action, dragged: active, target: over, activeSnapshot} = dragData
        if(!action || !active || !over || !activeSnapshot || active.index == null) return;
        const activeTypeAccepted = over.acceptTypes.includes(active.type)
        const dragToDifferentContainer = active.groupId !== over.groupId
        if(activeTypeAccepted && dragToDifferentContainer) {
            moveHandlers.current[active.type]?.(dragData)
        }
    }
    
    /**
     * Triggers when dragged item is released - applies state, calls api to save changes for cross container move
     * Used for:
     *  1. Same container drag - Updates state and can call api to immediately apply on backend
     *  2. Different container drag - apply change to state
     * Takes in consideration 3 main entities: 
     *  1. dragged item snapshot(before drag started) -> used on cross container dragging to apply state(dragged item is not enough since its already moved to new container)
     *  2. current dragged(active) item, 
     *  3. current target item(over, can be container or item itself)
     * @param event 
     * @returns 
     */
    const onDragEnd = (event: DragEndEvent) => {
        const dragData = mapEventToDragData('drag-end', event, activeItemSnapshot)
        //console.log(dragData)
        if(!dragData) return;
        const {action, dragged: active, target: over, activeSnapshot} = dragData
        if(!action || !active || !over || !activeSnapshot) return;
        const activeTypeAccepted = over.acceptTypes.includes(active.type)
        if(activeTypeAccepted)
            moveHandlers.current[active.type]?.(dragData)
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