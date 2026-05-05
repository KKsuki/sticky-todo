import { useState } from 'react'

export default function TodoItem({ todo, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className={`checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed && <span className="checkmark">✓</span>}
      </button>
      <span className="todo-text">{todo.text}</span>
      <button
        className={`delete-btn ${hovered ? 'visible' : ''}`}
        onClick={() => onDelete(todo.id)}
        title="删除"
      >
        ✕
      </button>
    </div>
  )
}
