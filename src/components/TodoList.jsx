import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import TodoItem from './TodoItem'

function TodoGroup({ title, icon, todos, droppableId, onToggle, onDelete }) {
  if (todos.length === 0) return null

  return (
    <div className="todo-group">
      <div className="group-header">
        <span className="group-icon">{icon}</span>
        <span className="group-title">{title}</span>
        <span className="group-count">{todos.length}</span>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            className="group-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {todos.map((todo, index) => (
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
    </div>
  )
}

export default function TodoList({ todos, onToggle, onDelete, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorder(result.source.index, result.destination.index)
  }

  const sorted = [...todos].sort((a, b) => a.order - b.order)
  const morningTodos = sorted.filter((t) => t.period === 'morning')
  const afternoonTodos = sorted.filter((t) => t.period === 'afternoon')
  const noPeriodTodos = sorted.filter((t) => !t.period)

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
      <div className="todo-list">
        <TodoGroup
          title="上午"
          icon="🌅"
          todos={morningTodos}
          droppableId="morning"
          onToggle={onToggle}
          onDelete={onDelete}
        />
        {(morningTodos.length > 0 && afternoonTodos.length > 0) && (
          <div className="group-divider" />
        )}
        <TodoGroup
          title="下午"
          icon="🌇"
          todos={afternoonTodos}
          droppableId="afternoon"
          onToggle={onToggle}
          onDelete={onDelete}
        />
        {noPeriodTodos.length > 0 && (
          <>
            <div className="group-divider" />
            <TodoGroup
              title="其他"
              icon="📋"
              todos={noPeriodTodos}
              droppableId="other"
              onToggle={onToggle}
              onDelete={onDelete}
            />
          </>
        )}
      </div>
    </DragDropContext>
  )
}
