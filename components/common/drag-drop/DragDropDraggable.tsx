import {useDraggable} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
interface DragDropDraggableProps {
    id: string,
    groupId: string,
    index: number,
    type: string,
    children: React.ReactNode,
}

export const DragDropDraggable = (p: DragDropDraggableProps) => {
    const {ref} = useSortable({
        id: p.id,
        group: p.groupId,
        index: p.index,
        type: p.type
    });

    return(
        <div ref={ref}>
            <p>{p.id}</p>
          { p.children }
        </div>
    )
}