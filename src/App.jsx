import { useState } from 'react'
import TitleBar from './components/TitleBar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import HistoryView from './components/HistoryView'
import MemoList from './components/MemoList'
import AddMemo from './components/AddMemo'
import { useTodos } from './hooks/useTodos'
import { useMemos } from './hooks/useMemos'

export default function App() {
  const [activeView, setActiveView] = useState('todo') // 'todo' | 'memo' | 'history'
  const {
    todos,
    loading: todoLoading,
    viewingDate,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    loadToday,
    loadByDate,
  } = useTodos()

  const {
    memos,
    loading: memoLoading,
    addMemo,
    updateMemo,
    deleteMemo,
    reorderMemos,
  } = useMemos()

  const loading = activeView === 'todo' ? todoLoading : memoLoading

  if (loading) {
    return <div className="sticky-app loading">加载中...</div>
  }

  const renderContent = () => {
    switch (activeView) {
      case 'history':
        return (
          <HistoryView
            onSelectDate={(date) => {
              loadByDate(date)
              setActiveView('todo')
            }}
            onBack={() => {
              loadToday()
              setActiveView('todo')
            }}
          />
        )
      case 'memo':
        return (
          <>
            <MemoList
              memos={memos}
              onUpdate={updateMemo}
              onDelete={deleteMemo}
              onReorder={reorderMemos}
            />
            <AddMemo onAdd={addMemo} />
          </>
        )
      case 'todo':
      default:
        return (
          <>
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onReorder={reorderTodos}
            />
            <AddTodo onAdd={addTodo} />
          </>
        )
    }
  }

  return (
    <div className="sticky-app">
      <TitleBar
        date={viewingDate}
        activeView={activeView}
        onSwitchView={setActiveView}
      />
      {renderContent()}
    </div>
  )
}
