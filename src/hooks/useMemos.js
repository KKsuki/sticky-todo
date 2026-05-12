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
        pinned: false,
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

  const togglePin = useCallback(
    (id) => {
      const updated = memos.map((m) =>
        m.id === id
          ? { ...m, pinned: !m.pinned, updatedAt: new Date().toISOString() }
          : m
      )
      saveMemos(updated)
    },
    [memos, saveMemos]
  )

  const reorderPinnedMemos = useCallback(
    (startIndex, endIndex) => {
      const pinned = memos.filter((m) => m.pinned)
      const unpinned = memos.filter((m) => !m.pinned)
      const result = Array.from(pinned)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      const reorderedPinned = result.map((m, i) => ({ ...m, pinnedOrder: i }))
      saveMemos([...reorderedPinned, ...unpinned])
    },
    [memos, saveMemos]
  )

  const reorderUnpinnedMemos = useCallback(
    (startIndex, endIndex) => {
      const pinned = memos.filter((m) => m.pinned)
      const unpinned = memos.filter((m) => !m.pinned)
      const result = Array.from(unpinned)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      const reorderedUnpinned = result.map((m, i) => ({ ...m, order: i }))
      saveMemos([...pinned, ...reorderedUnpinned])
    },
    [memos, saveMemos]
  )

  return {
    memos,
    loading,
    addMemo,
    updateMemo,
    deleteMemo,
    togglePin,
    reorderPinnedMemos,
    reorderUnpinnedMemos,
    refreshMemos: loadMemos,
  }
}
