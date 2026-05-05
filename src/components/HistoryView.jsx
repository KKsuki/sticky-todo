import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function HistoryView({ onSelectDate, onBack }) {
  const [dates, setDates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getHistory().then((d) => {
      setDates(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="history-view loading">加载中...</div>
  }

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
              onClick={() => onSelectDate(date)}
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
