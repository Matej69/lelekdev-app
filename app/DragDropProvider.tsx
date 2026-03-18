'use client'

import { useTasks } from '@/components/protected/tasks/useTasks';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { createContext, ReactNode, useState } from 'react';


/**
 * Context
 */
export const DragDropHandlerContext = createContext<{
  registerHandler: (type: string, handler: (result: DropResult) => void) => void;
}>({ registerHandler: () => {} });

/**
 * Handler
 */

export function DragDropProvider({ children }: { children: ReactNode })  {
    const [onDragEndHandlers, setOnDragEndHandlers] = useState<{ [type: string]: (result: DropResult) => void }>({})

    const registerHandler = (type: string, handler: (result: DropResult) => void) => {
        if(onDragEndHandlers[type]) return;
        setOnDragEndHandlers((prev) => ({...prev, [type]: handler}))
    }

    const onDragEnd = (result: DropResult) => {
        if (!result?.type) return;
        onDragEndHandlers[result.type]?.(result)
    }

    return (
        <DragDropHandlerContext.Provider value={{ registerHandler }}>
            <DragDropContext onDragEnd={onDragEnd}>
                {children}
            </DragDropContext>
        </DragDropHandlerContext.Provider>
    );
};
