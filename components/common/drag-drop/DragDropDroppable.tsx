import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSSProperties, HTMLAttributes } from "react";

export interface DragDropDroppableProps {
    id: string,
    type: string,
    acceptTypes: string[],
    item: any,
    items: any[],
    children: React.ReactNode,
    style?: CSSProperties
}

export const DragDropDroppable = (p: DragDropDroppableProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: p.id,
        data: {
            item: p.item,
            type: p.type,
            acceptTypes: p.acceptTypes
        },
    });

    return(
        <div ref={setNodeRef} className="py-[0.1px]" style={p.style}> {/* py - Fix for weird dnd-kit bug where it doesn't trigger if droppable has 1 element*/}
            <SortableContext items={p.items.map(el => el.id)} strategy={verticalListSortingStrategy}>
                { p.children }
            </SortableContext>
        </div>
    )
}