import { useState, useRef } from 'react'

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState('')
  const [period, setPeriod] = useState(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'morning' : 'afternoon'
  })
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (trimmed) {
      onAdd(trimmed, period)
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
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'morning' ? 'active' : ''}`}
          onClick={() => setPeriod('morning')}
          title="上午"
        >
          上午
        </button>
        <button
          className={`period-btn ${period === 'afternoon' ? 'active' : ''}`}
          onClick={() => setPeriod('afternoon')}
          title="下午"
        >
          下午
        </button>
      </div>
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
