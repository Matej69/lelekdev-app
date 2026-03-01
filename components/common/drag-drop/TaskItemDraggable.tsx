import { Draggable } from "@hello-pangea/dnd"

interface TaskItemDraggableProps<TItem> {
    index: number,
    item: TItem,
    children: React.ReactNode
}

export const TaskItemDraggable = <TItem extends {id: string},>(p: TaskItemDraggableProps<TItem>) => {
    return(
        <Draggable index={p.index} draggableId={p.item.id}>
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