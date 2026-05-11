import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function HistoryTodoItem({ todo }) {
  return (
    <div className={`history-todo-item ${todo.completed ? 'completed' : ''}`}>
      <span className={`history-checkbox ${todo.completed ? 'checked' : ''}`}>
        {todo.completed && <span className="checkmark">✓</span>}
      </span>
      <span className="history-todo-text">{todo.text}</span>
    </div>
  )
}

export default function HistoryView({ onSelectDate, onBack }) {
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getHistory().then((d) => {
      setDates(d)
      setLoading(false)
    })
  }, [])

  const handleSelectDate = async (date) => {
    setLoading(true)
    const data = await window.electronAPI.getTodosByDate(date)
    setTodos(data.todos || [])
    setSelectedDate(date)
    setLoading(false)
  }

  const handleBackToList = () => {
    setSelectedDate(null)
    setTodos([])
  }

  if (loading) {
    return <div className="history-view loading">加载中...</div>
  }

  // 显示某个日期的待办详情
  if (selectedDate) {
    const d = dayjs(selectedDate)
    const sorted = [...todos].sort((a, b) => a.order - b.order)
    const morningTodos = sorted.filter((t) => t.period === 'morning')
    const afternoonTodos = sorted.filter((t) => t.period === 'afternoon')
    const noPeriodTodos = sorted.filter((t) => !t.period)

    return (
      <div className="history-view">
        <div className="history-detail-header">
          <button className="back-link" onClick={handleBackToList}>
            ← 返回列表
          </button>
          <span className="history-detail-date">
            {d.month() + 1}月{d.date()}日 {weekDays[d.day()]}
          </span>
        </div>
        <div className="history-detail-content">
          {sorted.length === 0 ? (
            <div className="history-empty-todos">
              <p>该日暂无待办</p>
            </div>
          ) : (
            <>
              {morningTodos.length > 0 && (
                <div className="history-group">
                  <div className="history-group-header">
                    <span className="group-icon">🌅</span>
                    <span className="group-title">上午</span>
                    <span className="group-count">{morningTodos.length}</span>
                  </div>
                  {morningTodos.map((todo) => (
                    <HistoryTodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              )}
              {morningTodos.length > 0 && afternoonTodos.length > 0 && (
                <div className="group-divider" />
              )}
              {afternoonTodos.length > 0 && (
                <div className="history-group">
                  <div className="history-group-header">
                    <span className="group-icon">🌇</span>
                    <span className="group-title">下午</span>
                    <span className="group-count">{afternoonTodos.length}</span>
                  </div>
                  {afternoonTodos.map((todo) => (
                    <HistoryTodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              )}
              {noPeriodTodos.length > 0 && (
                <>
                  <div className="group-divider" />
                  <div className="history-group">
                    <div className="history-group-header">
                      <span className="group-icon">📋</span>
                      <span className="group-title">其他</span>
                      <span className="group-count">{noPeriodTodos.length}</span>
                    </div>
                    {noPeriodTodos.map((todo) => (
                      <HistoryTodoItem key={todo.id} todo={todo} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <button className="back-btn" onClick={onBack}>
          返回今天
        </button>
      </div>
    )
  }

  // 显示日期列表
  if (dates.length === 0) {
    return (
      <div className="history-view empty">
        <div className="empty-hint">
          <span className="empty-icon">📅</span>
          <p>暂无历史记录</p>
          <p className="empty-sub">完成一些待办后就会出现在这里</p>
        </div>
        <button className="back-btn" onClick={onBack}>
          返回今天
        </button>
      </div>
    )
  }

  return (
    <div className="history-view">
      <div className="history-list">
        {dates.map((date) => {
          const d = dayjs(date)
          return (
            <button
              key={date}
              className="history-item"
              onClick={() => handleSelectDate(date)}
            >
              <span className="history-date">
                {d.month() + 1}月{d.date()}日
              </span>
              <span className="history-weekday">{weekDays[d.day()]}</span>
            </button>
          )
        })}
      </div>
      <button className="back-btn" onClick={onBack}>
        返回今天
      </button>
    </div>
  )
}
