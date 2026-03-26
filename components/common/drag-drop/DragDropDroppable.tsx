import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DragDropDroppableProps<TItems> {
    id: string,
    type: string,
    acceptTypes: string[],
    items: any[],
    children: React.ReactNode,
}

export const DragDropDroppable = <TItems,>(p: DragDropDroppableProps<TItems>) => {

    return(
        <div>
            <SortableContext items={p.items.map(el => el.id)} strategy={verticalListSortingStrategy}>
                { p.children }
            </SortableContext>
        </div>
    )
}