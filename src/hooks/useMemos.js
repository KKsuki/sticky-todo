import { useState, useEffect, useCallback } from 'react'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useMemos() {
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMemos = useCallback(async () => {
    setLoading(true)
    const data = await window.electronAPI.getMemos()
    setMemos(data.memos || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadMemos()
  }, [loadMemos])

  const saveMemos = useCallback(
    async (newMemos) => {
      setMemos(newMemos)
      await window.electronAPI.saveMemos({ memos: newMemos })
    },
    []
  )

  const addMemo = useCallback(
    (title, content) => {
      const newMemo = {
        id: generateId(),
        title: title || '',
        content: content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: memos.length,
      }
      saveMemos([...memos, newMemo])
    },
    [memos, saveMemos]
  )

  const updateMemo = useCallback(
    (id, updates) => {
      const updated = memos.map((m) =>
        m.id === id
          ? { ...m, ...updates, updatedAt: new Date().toISOString() }
          : m
      )
      saveMemos(updated)
    },
    [memos, saveMemos]
  )

  const deleteMemo = useCallback(
    (id) => {
      saveMemos(memos.filter((m) => m.id !== id))
    },
    [memos, saveMemos]
  )

  const reorderMemos = useCallback(
    (startIndex, endIndex) => {
      const result = Array.from(memos)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      const reordered = result.map((m, i) => ({ ...m, order: i }))
      saveMemos(reordered)
    },
    [memos, saveMemos]
  )

  return {
    memos,
    loading,
    addMemo,
    updateMemo,
    deleteMemo,
    reorderMemos,
    refreshMemos: loadMemos,
  }
}
