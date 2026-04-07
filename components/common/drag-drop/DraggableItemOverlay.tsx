import DraggableSkeleton from "../Skeleton/draggable-skeleton"

interface DraggableItemOverlayProps {
}  

export const DraggableItemOverlay = (p: DraggableItemOverlayProps) => {
    return(
        <div>
            <DraggableSkeleton/>
        </div>
    )
}