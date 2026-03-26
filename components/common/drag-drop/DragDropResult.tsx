export type DragDropResult = {
    dragged: {
        id: string,
        type: string
    }
    initial: {
        containerId: string,
        itemIndex: number,
    },
    target: {
        containerId: string,
        itemIndex: number,
        type: string, 
    } 
}

export const dragDropEventToResult = (event: any):  DragDropResult | null => {
    if(!event?.operation?.source?.sortable || !event.operation?.source || !event.operation?.target)
        return null;
    const { id, initialGroup, initialIndex, group: targetGroup, index: targetIndex } = event.operation.source.sortable
    const type = event.operation.source.type
    const targetType = event.operation.target.type
    return {
        dragged: {
            id: id,
            type: type
        },
        initial: {
            containerId: initialGroup,
            itemIndex: initialIndex
        },
        target: {
            containerId: targetGroup,
            itemIndex: targetIndex,
            type: targetType
        }
    }
}