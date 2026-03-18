import { Draggable } from "@hello-pangea/dnd"

interface DragDropDraggableProps<TItem> {
    index: number,
    children: React.ReactNode,
    draggableId: string
}

export const DragDropDraggable = <TItem extends {id: string},>(p: DragDropDraggableProps<TItem>) => {
    return(
        <Draggable index={p.index} draggableId={p.draggableId}>
          {(draggable) => (
            <div
              ref={draggable.innerRef} 
              {...draggable.draggableProps}
              {...draggable.dragHandleProps}>
            { p.children }
            </div>
          )}
        </Draggable>
    )
}