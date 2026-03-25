'use client'

import { useTasks } from '@/components/protected/tasks/useTasks';
import {DragDropProvider as DndKitDragDropProvider, DragOverEvent, DragOverlay} from '@dnd-kit/react';
import { createContext, ReactNode, useRef, useState } from 'react';
import { dragDropEventToResult, DragDropResult } from './DragDropResult';


/**
 * Context
 */
export const DragDropHandlerContext = createContext<{
  registerHandler: (type: string, handler: (result: DragDropResult) => void) => void;
}>({ registerHandler: () => {} });

/**
 * Handler
 */

export function DragDropProvider({ children }: { children: ReactNode })  {
    const onDragEndHandlers = useRef<{ [type: string]: (result: DragDropResult) => void }>({})

    const registerHandler = (type: string, handler: (result: DragDropResult) => void) => {
        onDragEndHandlers.current[type] = handler
    }

    const onDragEnd = (event: any) => {
        const result = dragDropEventToResult(event)
        if(!result)
            return;
        console.log("ssss")
        onDragEndHandlers.current[result.dragged.type]?.(result)
    }

    return (
        <DragDropHandlerContext.Provider value={{ registerHandler }}>
            <DndKitDragDropProvider onDragEnd={onDragEnd}>
                {children}
            </DndKitDragDropProvider>
        </DragDropHandlerContext.Provider>
    );
};
