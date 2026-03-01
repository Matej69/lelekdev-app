import { Droppable } from "@hello-pangea/dnd"

interface TaskItemDroppableProps<TItems> {
    droppableId: string,
    items: TItems[],
    children: React.ReactNode
}

export const TaskItemDroppable = <TItems,>(p: TaskItemDroppableProps<TItems>) => {
    return(
        <Droppable droppableId={p.droppableId}>
            {(droppable) => (
              <div ref={droppable.innerRef} {...droppable.droppableProps}>
                { p.children }
                {droppable.placeholder}
              </div>
            )}
          </Droppable>
    )
}