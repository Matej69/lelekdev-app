'use client'

import { useTasks } from '@/components/protected/tasks/useTasks';
import { createContext, ReactNode, useRef, useState } from 'react';
import { dragDropEventToResult, DragDropResult } from './DragDropResult';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { DraggableItemOverlay } from './DraggableItemOverlay';
import DraggableSkeleton from '../Skeleton/draggable-skeleton';


/**
 * Context
 */
export const DragDropHandlerContext = createContext<{
  registerHandler: (type: string, handler: (result: DragDropResult) => void) => void,
  registerSwapHandler: (type: string, handler: (activeContainerId: string | null, overContainerId: string, activeIndex: number, overIndex: number) => void) => void
}>({ 
    registerHandler: () => {},
    registerSwapHandler: () => {} 
});

/**
 * Handler
 */

export function DragDropProvider({ children }: { children: ReactNode })  {
    const onDragEndHandlers = useRef<{ [type: string]: (result: DragDropResult) => void }>({})
    const onSwapSectionHandlers = useRef<{ [type: string]: (activeContainerId: string | null, overContainerId: string, activeIndex: number, overIndex: number) => void }>({})
    const [activeItem, setActiveItem] = useState<{title: string | null} | null>(null)

    const sensors = useSensors(useSensor(
        PointerSensor, { activationConstraint: { distance: 3 } }
    ))

    const registerHandler = (type: string, handler: (result: DragDropResult) => void) => {
        onDragEndHandlers.current[type] = handler
    }
    const registerSwapHandler = (type: string, handler: (activeContainerId: string | null, overContainerId: string, activeIndex: number, overIndex: number) => void) => {
        onSwapSectionHandlers.current[type] = handler
    }

    const onDragStart = (event: DragStartEvent) => {
        const item = event.active.data.current?.item;
        console.log(item)
        setActiveItem(item)
    }

    const onDragEnd = (event: DragEndEvent) => {
        setActiveItem(null)
        //const result = dragDropEventToResult(event)
        //if(!result)
        //    return;
        //onDragEndHandlers.current[result.dragged.type]?.(result)
        console.log("event")
        const {active, over} = event
        if(!over)
            return;
        if(active.id === over.id)
            return;
        const activeIndex = active.data.current?.sortable?.index
        const overIndex = over.data.current?.sortable?.index
        const activeType = active.data.current?.type
        const overType = over.data.current?.type
        const activeContainer = active.data.current?.containerId
        const overContainer = over.data.current?.containerId
        if(activeContainer == overContainer && activeType == overType && activeIndex != null && overIndex != null)
            onSwapSectionHandlers.current[activeType]?.(activeContainer, overContainer, activeIndex, overIndex)
    }

    const onDragOver = (event: DragOverEvent) => {
        console.log(event)
        const {active, over} = event
        if(!over)
            return;
        if(active.id === over.id)
            return;
        const activeIndex = active.data.current?.sortable?.index
        const overIndex = over.data.current?.sortable?.index
        const activeType = active.data.current?.type
        const overType = over.data.current?.type
        const activeContainer = active.data.current?.containerId
        const overContainer = over.data.current?.containerId
        if(activeContainer !== overContainer && activeType == overType && activeIndex != null && overIndex != null)
            onSwapSectionHandlers.current[activeType]?.(activeContainer, overContainer, activeIndex, overIndex)
    }

    return (
        <DragDropHandlerContext.Provider value={{ registerHandler, registerSwapHandler }}>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd} onDragStart={onDragStart} onDragOver={onDragOver}>
                {children}
                <DragOverlay dropAnimation={null} style={{ cursor: 'pointer' }}>
                        { /*activeItem && <DraggableSkeleton/>*/ }
                </DragOverlay>
            </DndContext>
        </DragDropHandlerContext.Provider>
    );
};
