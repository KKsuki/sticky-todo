import { useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import MemoItem from './MemoItem'

function MemoDroppable({ memos, droppableId, onUpdate, onDelete, onTogglePin }) {
  return (
    <Droppable droppableId={droppableId} direction="vertical">
      {(provided, snapshot) => (
        <div
          className={`memo-group-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {memos.map((memo, index) => (
            <Draggable key={memo.id} draggableId={memo.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={provided.draggableProps.style}
                  className={`drag-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                  <MemoItem
                    memo={memo}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onTogglePin={onTogglePin}
                    dragHandleProps={provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

export default function MemoList({
  memos,
  onUpdate,
  onDelete,
  onTogglePin,
  onReorderPinned,
  onReorderUnpinned,
}) {
  const pinnedMemos = useMemo(
    () => memos.filter((m) => m.pinned).sort((a, b) => (a.pinnedOrder || 0) - (b.pinnedOrder || 0)),
    [memos]
  )
  const unpinnedMemos = useMemo(
    () => memos.filter((m) => !m.pinned).sort((a, b) => a.order - b.order),
    [memos]
  )

  const handleDragEnd = (result) => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'pinned') {
        onReorderPinned(source.index, destination.index)
      } else if (source.droppableId === 'unpinned') {
        onReorderUnpinned(source.index, destination.index)
      }
    }
  }

  if (memos.length === 0) {
    return (
      <div className="memo-list empty">
        <div className="empty-hint">
          <span className="empty-icon">📋</span>
          <p>还没有备忘录</p>
          <p className="empty-sub">点击下方 + 添加一条吧</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="memo-list">
        {pinnedMemos.length > 0 && (
          <div className="memo-group">
            <div className="memo-group-header">
              <span className="memo-group-icon">📌</span>
              <span className="memo-group-title">置顶</span>
              <span className="memo-group-count">{pinnedMemos.length}</span>
            </div>
            <MemoDroppable
              memos={pinnedMemos}
              droppableId="pinned"
              onUpdate={onUpdate}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          </div>
        )}
        {pinnedMemos.length > 0 && unpinnedMemos.length > 0 && (
          <div className="memo-divider" />
        )}
        {unpinnedMemos.length > 0 && (
          <MemoDroppable
            memos={unpinnedMemos}
            droppableId="unpinned"
            onUpdate={onUpdate}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
          />
        )}
      </div>
    </DragDropContext>
  )
}
