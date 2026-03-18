import { Droppable } from "@hello-pangea/dnd"

interface DragDropDroppableProps<TItems> {
    droppableId: string,
    type: string,
    items: TItems[],
    children: React.ReactNode,
}

export const DragDropDroppable = <TItems,>(p: DragDropDroppableProps<TItems>) => {
    return(
        <Droppable droppableId={p.droppableId} type={p.type}>
            {(droppable) => (
              <div ref={droppable.innerRef} {...droppable.droppableProps}>
                { p.children }
                {droppable.placeholder}
              </div>
            )}
          </Droppable>
    )
}