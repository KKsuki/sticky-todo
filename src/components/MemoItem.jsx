import { useState } from 'react'

export default function MemoItem({ memo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(memo.title)
  const [editContent, setEditContent] = useState(memo.content)

  const handleSave = () => {
    onUpdate(memo.id, { title: editTitle, content: editContent })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(memo.title)
    setEditContent(memo.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hour = d.getHours().toString().padStart(2, '0')
    const minute = d.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hour}:${minute}`
  }

  if (isEditing) {
    return (
      <div className="memo-item editing">
        <input
          type="text"
          className="memo-edit-title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="备忘录标题"
          autoFocus
        />
        <textarea
          className="memo-edit-content"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="备忘录内容..."
          rows={3}
        />
        <div className="memo-edit-actions">
          <button className="memo-save-btn" onClick={handleSave}>
            保存
          </button>
          <button className="memo-cancel-btn" onClick={handleCancel}>
            取消
          </button>
        </div>
        <div className="memo-edit-hint">Ctrl+Enter 保存 | Esc 取消</div>
      </div>
    )
  }

  return (
    <div className="memo-item">
      <div className="memo-content" onClick={() => setIsEditing(true)}>
        {memo.title && <div className="memo-title">{memo.title}</div>}
        {memo.content && <div className="memo-text">{memo.content}</div>}
        {!memo.title && !memo.content && (
          <div className="memo-empty">点击编辑备忘录...</div>
        )}
        <div className="memo-time">{formatDate(memo.updatedAt)}</div>
      </div>
      <button
        className="memo-delete-btn"
        onClick={() => onDelete(memo.id)}
        title="删除"
      >
        ✕
      </button>
    </div>
  )
}
