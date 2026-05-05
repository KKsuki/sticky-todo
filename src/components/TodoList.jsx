import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import TodoItem from './TodoItem'

export default function TodoList({ todos, onToggle, onDelete, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorder(result.source.index, result.destination.index)
  }

  const sorted = [...todos].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
    return (
      <div className="todo-list empty">
        <div className="empty-hint">
          <span className="empty-icon">📝</span>
          <p>还没有待办事项</p>
          <p className="empty-sub">点击下方 + 添加一条吧</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todo-list">
        {(provided) => (
          <div
            className="todo-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sorted.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`drag-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <TodoItem
                      todo={todo}
                      onToggle={onToggle}
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
