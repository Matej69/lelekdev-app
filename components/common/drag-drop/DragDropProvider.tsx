'use client'

import { createContext, ReactNode, useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors } from '@dnd-kit/core';
import { mapEventToDragData, DragEvent } from './DragEvent';


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
    const [activeItem, setActiveItem] = useState<{title: string | null} | null>(null)

    const sensors = useSensors(useSensor(
        PointerSensor, { activationConstraint: { distance: 3 } }
    ))

    const registerHandler = (type: string, handler: (dragEvent: DragEvent) => void) => {
        moveHandlers.current[type] = handler
    }

    const onDragStart = (event: DragStartEvent) => {
        const item = event.active.data.current?.item;
        setActiveItem(item)
    }

    const onDragEnd = (event: DragEndEvent) => {
        setActiveItem(null)
        const {active, over} = mapEventToDragData(event) || {}
        if(!active || !over)
            return;
        if(active.id === over.id)
            return;

        if(active.groupId == over.groupId && active.type == over.type && active.index != null && over.index != null) {
            moveHandlers.current[active.type]?.({active, over})
        }
    }

    const onDragOver = (event: DragOverEvent) => {
        const {active, over} = mapEventToDragData(event) || {}
        if(!active || !over)
            return;
        if(active.id === over.id)
            return;

        if(active.groupId !== over.groupId && active.index != null) // Skip for same container or non defined draggable index
            moveHandlers.current[active.type]?.({active, over})
    }

    return (
        <DragDropHandlerContext.Provider value={{ registerHandler }}>
            <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={onDragEnd} onDragStart={onDragStart} onDragOver={onDragOver}>
                {children}
                <DragOverlay dropAnimation={null} style={{ cursor: 'pointer' }}>
                        { /*activeItem && <DraggableSkeleton/>*/ }
                </DragOverlay>
            </DndContext>
        </DragDropHandlerContext.Provider>
    );
};