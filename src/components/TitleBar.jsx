import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(dateStr) {
  const d = dayjs(dateStr)
  return `${d.month() + 1}月${d.date()}日 ${weekDays[d.day()]}`
}

export default function TitleBar({ date, isHistory, onToggleHistory }) {
  return (
    <div className="title-bar">
      <div className="title-text">
        {isHistory ? '历史记录' : `${formatDate(date)} 待办`}
      </div>
      <div className="title-actions">
        <button
          className="title-btn history-btn"
          onClick={onToggleHistory}
          title={isHistory ? '返回今天' : '查看历史'}
        >
          {isHistory ? '↩' : '📅'}
        </button>
        <button
          className="title-btn minimize-btn"
          onClick={() => window.electronAPI.minimizeWindow()}
          title="最小化"
        >
          ─
        </button>
        <button
          className="title-btn close-btn"
          onClick={() => window.electronAPI.closeWindow()}
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
