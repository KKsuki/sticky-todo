import { useState, useRef, useEffect } from 'react'

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (trimmed) {
      onAdd(trimmed)
      setText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setText('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`add-todo ${focused ? 'focused' : ''}`}>
      <button className="add-btn" onClick={handleSubmit} title="添加待办">
        +
      </button>
      <input
        ref={inputRef}
        type="text"
        className="add-input"
        placeholder="添加新的待办事项..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
