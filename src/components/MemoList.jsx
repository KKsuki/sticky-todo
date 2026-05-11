import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import MemoItem from './MemoItem'

export default function MemoList({ memos, onUpdate, onDelete, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorder(result.source.index, result.destination.index)
  }

  const sorted = [...memos].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
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
      <Droppable droppableId="memo-list">
        {(provided) => (
          <div
            className="memo-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sorted.map((memo, index) => (
              <Draggable key={memo.id} draggableId={memo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`drag-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <MemoItem
                      memo={memo}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
