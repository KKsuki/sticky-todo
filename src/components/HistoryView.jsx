import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import CalendarView from './CalendarView'

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
  const [selectedDate, setSelectedDate] = useState(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSelectDate = async (date) => {
    setLoading(true)
    const data = await window.electronAPI.getTodosByDate(date)
    setTodos(data.todos || [])
    setSelectedDate(date)
    setLoading(false)
  }

  const handleBackToCalendar = () => {
    setSelectedDate(null)
    setTodos([])
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
          <button className="back-link" onClick={handleBackToCalendar}>
            ← 返回日历
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

  // 显示日历
  if (loading) {
    return <div className="history-view loading">加载中...</div>
  }

  return (
    <CalendarView
      onSelectDate={handleSelectDate}
      onBack={onBack}
    />
  )
}
