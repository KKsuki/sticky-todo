import { useState, useEffect, useCallback } from 'react'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useTodos() {
  const [todos, setTodos] = useState([])
  const [viewingDate, setViewingDate] = useState(getDateStr())
  const [loading, setLoading] = useState(true)

  const loadToday = useCallback(async () => {
    setLoading(true)
    const data = await window.electronAPI.getTodayTodos()
    setTodos(data.todos || [])
    setViewingDate(getDateStr())
    setLoading(false)
  }, [])

  const loadByDate = useCallback(async (date) => {
    setLoading(true)
    const data = await window.electronAPI.getTodosByDate(date)
    setTodos(data.todos || [])
    setViewingDate(date)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadToday()
  }, [loadToday])

  const saveTodos = useCallback(
    async (newTodos) => {
      setTodos(newTodos)
      await window.electronAPI.saveTodos({
        date: viewingDate,
        todos: newTodos,
      })
    },
    [viewingDate]
  )

  const addTodo = useCallback(
    (text, period = 'morning') => {
      const newTodo = {
        id: generateId(),
        text,
        completed: false,
        period,
        createdAt: new Date().toISOString(),
        order: todos.length,
      }
      saveTodos([...todos, newTodo])
    },
    [todos, saveTodos]
  )

  const toggleTodo = useCallback(
    (id) => {
      const updated = todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
      saveTodos(updated)
    },
    [todos, saveTodos]
  )

  const deleteTodo = useCallback(
    (id) => {
      saveTodos(todos.filter((t) => t.id !== id))
    },
    [todos, saveTodos]
  )

  const reorderTodos = useCallback(
    (startIndex, endIndex) => {
      const result = Array.from(todos)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      const reordered = result.map((t, i) => ({ ...t, order: i }))
      saveTodos(reordered)
    },
    [todos, saveTodos]
  )

  return {
    todos,
    loading,
    viewingDate,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    loadToday,
    loadByDate,
  }
}
