import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DragDropDraggableProps {
    id: string,
    containerId: string,
    index: number,
    type: string,
    children: React.ReactNode,
    item: any
}

export const DragDropDraggable = (p: DragDropDraggableProps) => {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
        id: p.id,
        data: {
            item: p.item,
            type: p.type,
            containerId: p.containerId
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    }

    return(
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
            <p>{p.id}</p>
          { p.children }
        </div>
    )
}