import { useState, useRef } from 'react'

export default function AddMemo({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleRef = useRef(null)

  const handleSubmit = () => {
    if (title.trim() || content.trim()) {
      onAdd(title.trim(), content.trim())
      setTitle('')
      setContent('')
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle('')
      setContent('')
      setIsExpanded(false)
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => titleRef.current?.focus(), 100)
  }

  if (!isExpanded) {
    return (
      <div className="add-memo" onClick={handleExpand}>
        <button className="add-btn">+</button>
        <span className="add-memo-hint">新建备忘录</span>
      </div>
    )
  }

  return (
    <div className="add-memo expanded">
      <input
        ref={titleRef}
        type="text"
        className="add-memo-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="标题（可选）"
      />
      <textarea
        className="add-memo-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="备忘录内容..."
        rows={3}
      />
      <div className="add-memo-actions">
        <button className="add-memo-submit" onClick={handleSubmit}>
          添加
        </button>
        <button
          className="add-memo-cancel"
          onClick={() => {
            setTitle('')
            setContent('')
            setIsExpanded(false)
          }}
        >
          取消
        </button>
      </div>
      <div className="add-memo-hint">Ctrl+Enter 添加 | Esc 取消</div>
    </div>
  )
}
