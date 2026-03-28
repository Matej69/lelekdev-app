import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DragDropDroppableProps<TItems> {
    id: string,
    type: string,
    acceptTypes: string[],
    item: any,
    items: any[],
    children: React.ReactNode,
}

export const DragDropDroppable = <TItems,>(p: DragDropDroppableProps<TItems>) => {
    const { setNodeRef, isOver } = useDroppable({
        id: p.id,
        data: {
            item: p.item,
            type: p.type
        },
    });

    return(
        <div ref={setNodeRef}>
            <SortableContext items={p.items.map(el => el.id)} strategy={verticalListSortingStrategy}>
                { p.children }
            </SortableContext>
        </div>
    )
}