import { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarView({ onSelectDate, onBack }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [datesWithTodos, setDatesWithTodos] = useState([])
  const [hoveredDate, setHoveredDate] = useState(null)
  const [previewTodos, setPreviewTodos] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 })
  const hoverTimerRef = useRef(null)
  const previewRef = useRef(null)

  // 获取当前月份有待办的日期
  const fetchMonthDates = useCallback(async () => {
    const yearMonth = `${currentMonth.year()}年${currentMonth.month() + 1}月`
    const dates = await window.electronAPI.getMonthDates(yearMonth)
    setDatesWithTodos(dates)
  }, [currentMonth])

  useEffect(() => {
    fetchMonthDates()
  }, [fetchMonthDates])

  // 处理鼠标悬停，延迟显示预览
  const handleDateHover = useCallback((dateStr, event) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    if (!datesWithTodos.includes(dateStr)) {
      setHoveredDate(null)
      setShowPreview(false)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setPreviewPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2
    })

    hoverTimerRef.current = setTimeout(async () => {
      setHoveredDate(dateStr)
      const data = await window.electronAPI.getTodosByDate(dateStr)
      setPreviewTodos(data.todos || [])
      setShowPreview(true)
    }, 1000)
  }, [datesWithTodos])

  // 处理鼠标离开
  const handleDateLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    setShowPreview(false)
    setHoveredDate(null)
  }, [])

  // 点击日期
  const handleDateClick = useCallback((dateStr) => {
    onSelectDate(dateStr)
  }, [onSelectDate])

  // 切换月份
  const changeMonth = useCallback((delta) => {
    setCurrentMonth(prev => prev.add(delta, 'month'))
    setShowPreview(false)
  }, [])

  // 获取日历网格数据
  const getCalendarDays = useCallback(() => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDay = startOfMonth.day() // 0-6, 周日-周六
    const daysInMonth = endOfMonth.date()

    const days = []

    // 填充上个月的日期
    for (let i = 0; i < startDay; i++) {
      const date = startOfMonth.subtract(startDay - i, 'day')
      days.push({
        date: date.format('YYYY-MM-DD'),
        day: date.date(),
        isCurrentMonth: false
      })
    }

    // 填充本月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i)
      days.push({
        date: date.format('YYYY-MM-DD'),
        day: i,
        isCurrentMonth: true
      })
    }

    // 填充下个月的日期，补齐到42天（6行）
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = endOfMonth.add(i, 'day')
      days.push({
        date: date.format('YYYY-MM-DD'),
        day: date.date(),
        isCurrentMonth: false
      })
    }

    return days
  }, [currentMonth])

  const calendarDays = getCalendarDays()
  const today = dayjs().format('YYYY-MM-DD')

  return (
    <div className="calendar-view">
      {/* 月份导航 */}
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <div className="calendar-title">
          {currentMonth.format('YYYY年M月')}
        </div>
        <button className="calendar-nav-btn" onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>

      {/* 星期标题 */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="calendar-grid">
        {calendarDays.map(({ date, day, isCurrentMonth }) => {
          const hasTodos = datesWithTodos.includes(date)
          const isToday = date === today
          const isHovered = date === hoveredDate

          return (
            <div
              key={date}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${hasTodos ? 'has-todos' : ''} ${isToday ? 'today' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => handleDateClick(date)}
              onMouseEnter={(e) => handleDateHover(date, e)}
              onMouseLeave={handleDateLeave}
            >
              <span className="day-number">{day}</span>
              {hasTodos && <span className="todo-dot"></span>}
            </div>
          )
        })}
      </div>

      {/* 悬停预览 */}
      {showPreview && previewTodos.length > 0 && (
        <div
          ref={previewRef}
          className="calendar-preview"
          style={{
            top: `${previewPosition.top}px`,
            left: `${previewPosition.left}px`
          }}
        >
          <div className="preview-date">{hoveredDate}</div>
          <div className="preview-todos">
            {previewTodos.slice(0, 5).map((todo, index) => (
              <div key={todo.id} className={`preview-todo ${todo.completed ? 'completed' : ''}`}>
                <span className="preview-check">{todo.completed ? '✓' : '○'}</span>
                <span className="preview-text">{todo.text}</span>
              </div>
            ))}
            {previewTodos.length > 5 && (
              <div className="preview-more">还有 {previewTodos.length - 5} 项...</div>
            )}
          </div>
        </div>
      )}

      {/* 底部按钮 */}
      <button className="back-btn" onClick={onBack}>
        返回今天
      </button>
    </div>
  )
}
