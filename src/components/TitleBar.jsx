import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(dateStr) {
  const d = dayjs(dateStr)
  return `${d.month() + 1}月${d.date()}日 ${weekDays[d.day()]}`
}

export default function TitleBar({ date, activeView, onSwitchView }) {
  const getTitle = () => {
    switch (activeView) {
      case 'history':
        return '历史记录'
      case 'memo':
        return '备忘录'
      case 'todo':
      default:
        return `${formatDate(date)} 待办`
    }
  }

  return (
    <div className="title-bar">
      <div className="title-text">
        {getTitle()}
      </div>
      <div className="title-actions">
        <div className="view-tabs">
          <button
            className={`tab-btn ${activeView === 'todo' ? 'active' : ''}`}
            onClick={() => onSwitchView('todo')}
            title="待办"
          >
            ✓
          </button>
          <button
            className={`tab-btn ${activeView === 'memo' ? 'active' : ''}`}
            onClick={() => onSwitchView('memo')}
            title="备忘录"
          >
            📋
          </button>
        </div>
        <button
          className="title-btn history-btn"
          onClick={() => onSwitchView(activeView === 'history' ? 'todo' : 'history')}
          title={activeView === 'history' ? '返回今天' : '查看历史'}
        >
          {activeView === 'history' ? '↩' : '📅'}
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
