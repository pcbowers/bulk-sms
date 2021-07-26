/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, Reducer, useEffect, useReducer } from "react"
import { useToggle } from "./useToggle"
import { useWindowEvent } from "./useWindowEvent"

export interface StickyReducerAction {
  type: string
  payload: any
}

export function useStickyReducer(
  reducer: Reducer<any, StickyReducerAction>,
  defaultValue: string,
  storageKey: string
): [any, Dispatch<StickyReducerAction>] {
  const [value, dispatch] = useReducer(reducer, defaultValue, () => {
    const stickyValue = window.localStorage.getItem(storageKey)
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })
  const [canStore, toggleCanStore] = useToggle(true)

  const handler = (e: StorageEvent) => {
    if (
      e.storageArea === window.localStorage &&
      e.key === storageKey &&
      e.newValue !== value
    ) {
      if (e.newValue === null) toggleCanStore()
      dispatch({
        type: "STORAGE_CHANGE",
        payload: JSON.parse(String(e.newValue))
      })
    }
  }

  useWindowEvent("storage", handler)

  useEffect(() => {
    if (canStore) window.localStorage.setItem(storageKey, JSON.stringify(value))
    if (!canStore) toggleCanStore()
  }, [storageKey, value])

  return [value, dispatch]
}
