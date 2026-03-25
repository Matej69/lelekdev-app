import { useDroppable } from "@dnd-kit/react";

interface DragDropDroppableProps<TItems> {
    id: string,
    type: string,
    acceptTypes: string[],
    children: React.ReactNode,
}

export const DragDropDroppable = <TItems,>(p: DragDropDroppableProps<TItems>) => {
    const {ref, isDropTarget} = useDroppable({
        id: p.id,
        type: p.type,
        accept: p.acceptTypes
    });

    return(
        <div ref={ref}>
            <p>{p.id}</p>
            { p.children }
        </div>
    )
}