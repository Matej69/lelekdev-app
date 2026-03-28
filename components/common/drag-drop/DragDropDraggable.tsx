import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface DragDropDraggableProps {
    id: string,
    containerId: string,
    index: number,
    type: string,
    children: React.ReactNode,
    item: any
}

export const DragDropDraggable = (p: DragDropDraggableProps) => {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: p.id,
        data: {
            item: p.item,
            type: p.type,
            containerId: p.containerId
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: `${transition}, opacity 0.3s ease`,
        opacity: isDragging ? 0.4 : 1

    }
    const overlayStyle = {
        backgroundColor: isDragging ? '#eee' : undefined,
    }

    return(
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
            { p.children }
        </div>
    )
}