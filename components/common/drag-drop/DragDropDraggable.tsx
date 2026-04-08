import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

export interface DragDropDraggableProps {
    id: string,
    containerId: string,
    index: number,
    type: string,
    acceptTypes: string[],
    children: React.ReactNode,
    item: any
}

export const DragDropDraggable = (p: DragDropDraggableProps) => {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: p.id,
        data: {
            item: p.item,
            type: p.type,
            index: p.index,
            containerId: p.containerId,
            acceptTypes: p.acceptTypes
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: `${transition}, opacity 0.3s ease`,
        opacity: isDragging ? 0.4 : 1
    }

    return(
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} tabIndex={-1}>
            { p.children }
        </div>
    )
}