import { useState } from 'react'
import TitleBar from './components/TitleBar'
import TodoList from './components/TodoList'
import AddTodo from './components/AddTodo'
import HistoryView from './components/HistoryView'
import { useTodos } from './hooks/useTodos'

export default function App() {
  const [showHistory, setShowHistory] = useState(false)
  const {
    todos,
    loading,
    viewingDate,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    loadToday,
    loadByDate,
  } = useTodos()

  if (loading) {
    return <div className="sticky-app loading">加载中...</div>
  }

  return (
    <div className="sticky-app">
      <TitleBar
        date={viewingDate}
        isHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />
      {showHistory ? (
        <HistoryView
          onSelectDate={(date) => {
            loadByDate(date)
            setShowHistory(false)
          }}
          onBack={() => {
            loadToday()
            setShowHistory(false)
          }}
        />
      ) : (
        <>
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onReorder={reorderTodos}
          />
          <AddTodo onAdd={addTodo} />
        </>
      )}
    </div>
  )
}
